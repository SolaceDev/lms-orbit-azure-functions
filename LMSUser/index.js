module.exports = async function (context, req) {
  const Validator = require('jsonschema').Validator;
  var schema = require("./schema.json") // Note: this schema could be queried from EP using Solace Cloud API
  var schemaValidator = new Validator();

  // Access Orbit Token: process.env["ORBIT_TOKEN"]
  // Make sure local.settings.json exists in root of project
  const OrbitMembers = require('@orbit-love/members')
  const OrbitActivities = require('@orbit-love/activities')
  const orbitWorkspaceId = process.env["ORBIT_WORKSPACE"] || "solace-staging"
  const orbitMembers = new OrbitMembers(orbitWorkspaceId, process.env["ORBIT_TOKEN"])
  const orbitActivities = new OrbitActivities(orbitWorkspaceId, process.env["ORBIT_TOKEN"])

  // Validate the incoming payload schema
  const body = req.body || null;
  var validationResults = schemaValidator.validate(body, schema)

  // Return if schema validation error
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

  // Prepare Orbit data
  var orbitData = {
    member: {
      name: body.payload.firstname + " " + body.payload.lastname,
      email: body.payload.email,
      tags_to_add: ['Training']
    }
  }
  // Create member
  orbitMembers.createMember(orbitData).then(member => {
    var act = {
      activity_type: 'LMS:JoinDate',
      title: "Join date on LMS",
      occurred_at: body.payload.creation_date
    }
    orbitActivities.createActivity(member.data.id, act).then(result => {
      // Print activity creation response
      // console.log(result)
    }).catch(error => {
      console.error(error)
      context.res = {
        status: 404,
        body: {
          "status": "Failed ro create orbit activity",
          "message": error
        }
      };
      return
    })
    // Print member creation response
    // console.log(member)
  }).catch(error => {
    console.error(error)
    context.res = {
      status: 404,
      body: {
        "status": "Failed ro create orbit member",
        "message": error
      }
    };
    return
  })

  context.res = { // status: 200, /* Defaults to 200 */
    body: {
      "status": "User successfully added member to Orbit",
      "Name": body.payload.firstname
    }
  };
}
