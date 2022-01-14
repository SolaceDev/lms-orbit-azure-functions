

module.exports = async function (context, req) {
    // Access Orbit Token: process.env["ORBIT_TOKEN"]
    // Make sure local.settings.json exists in root of project

    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = "Response Message"

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}