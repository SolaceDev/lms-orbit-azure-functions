const {SecretClient} = require("@azure/keyvault-secrets");
const {DefaultAzureCredential} = require("@azure/identity");
const LmsClient = require('./util/LmsClient');
const certs = require('./util/certs');
const Validator = require('jsonschema').Validator;
var schema = require("./course-schema.json") // Note: this schema could be queried from EP using Solace Cloud API
const OrbitActivities = require('@orbit-love/activities')


module.exports = async function (context, req) {
  // Validate Schema of incoming request
  // Return 404 for failed validation
  var schemaValidator = new Validator();
  var validationResults = schemaValidator.validate(req.body, schema)
  if (validationResults.errors.length != 0) {
    context.res = {
      status: 404,
      body: {
        "status": "Failed Schema Validation",
        "message": validationResults.errors[0].stack
      }
    };
    return
  }

  // Check if the cert id is part of the list of valid IDs
  const validCert = certs.find(cert => cert.id === req.body.payload.course_id)

  if (validCert) { // The course ID is known
    context.log(`User completed course ${
      validCert.name
    }`)
    const orbitWorkspaceId = process.env["ORBIT_WORKSPACE"] || "solace-staging"
    const orbitActivities = new OrbitActivities(orbitWorkspaceId, process.env["ORBIT_TOKEN"])

    // Query user information from LMS
    const lmsClient = new LmsClient(process.env["LMS_BASE_URL"]);
    const AzureSecretClient = new SecretClient(process.env["KVURL"], new DefaultAzureCredential());

    // Check if LMS token is still valid
    context.log("Checking if LMS access token is still valid");
    let lmsToken = await AzureSecretClient.getSecret("LmsAccessToken");
    await lmsClient.setAuthorizationToken(lmsToken.value);
    let valid = await lmsClient.validateAccessToken();
    context.log("Token valid? ", valid ? "Yes" : "No");

    if (! valid) {
      context.log("LMS access token has expired");
      // Refresh token
      let lmsRefreshToken = await AzureSecretClient.getSecret("LmsRefreshToken");
      let lmsClientId = await AzureSecretClient.getSecret("LmsClientId");
      let lmsClientSecret = await AzureSecretClient.getSecret("LmsClientSecret");
      context.log("Refreshing LMS access token");
      let newTokenResp = await lmsClient.refreshAccessToken(lmsRefreshToken.value, lmsClientId.value, lmsClientSecret.value);
      lmsToken = newTokenResp.access_token;
      await lmsClient.setAuthorizationToken(lmsToken);
      // Store new token in Key Vault
      context.log("Storing new LMS access token in Key Vault");
      await AzureSecretClient.setSecret("LmsAccessToken", lmsToken);
      await AzureSecretClient.setSecret("LmsRefreshToken", newTokenResp.refresh_token);
    }

    const user = await lmsClient.getUser(req.body.payload.user_id)

    if (user) {
      // LMS USER FOUND
      // Create Orbit Activity for completed certificate
      var act = {
        member: {
          name: `${
            user.data.user_data.first_name
          } ${
            user.data.user_data.last_name
          }`,
          email: user.data.user_data.email,
          tags_to_add: "Certified"
        },
        description: validCert.name,
        title: validCert.orbit_key,
        occurred_at: new Date(req.body.payload.completion_date)
      }

      orbitActivities.createActivity(act).then(result => {
        // Print activity creation response
        // console.log(result)
        // Set the body of the function return
      }).catch(error => {
        context.error("Orbit Create Activity failed: ", error)
        context.res = {
          status: 404,
          body: {
            "status": "Failed ro create orbit activity",
            "message": error
          }
        };
        return
      })
    } else {
      context.res = {
        status: 404,
        body: `User ${
          req.body.payload.user_id
        } could not be located in LMS`
      };
      return
    }
  } else {
    context.res = {
      status: 404,
      body: `User completed an unknown courseID: ${
        req.body.payload.course_id
      }`
    };
    return
  }

  // Success
  context.res = {
    body: {
      "status": "Activity successfully added to Orbit",
      "UserID": req.body.payload.user_id,
      "Course": validCert.name
    }
  }
}
