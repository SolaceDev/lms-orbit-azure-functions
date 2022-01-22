module.exports = async function (context, req) {
  // Access Orbit Token: process.env["ORBIT_TOKEN"]
  // Make sure local.settings.json exists in root of project
  const OrbitMembers = require('@orbit-love/members')
  const orbitWorkspaceId = process.env["ORBIT_WORKSPACE"] || "solace-staging"
  const orbitMembers = new OrbitMembers(orbitWorkspaceId, process.env["ORBIT_TOKEN"])

  const query = {
    page: 1,
    items: 50
  }

  var members = []

  orbitMembers.listMembers(query).then(data => {
    console.log(data)
    members = data
  }).catch(error => {
    console.error(error)
  })

  const name = (req.query.name || (req.body && req.body.name));
  const responseMessage = members || "Response Message"

  context.res = { // status: 200, /* Defaults to 200 */
    body: responseMessage
  };
}
