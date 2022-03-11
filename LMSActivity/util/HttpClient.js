//
// HTTP Helper Functions
//

// Axios for HTTP Requests
const axios = require('axios');

class HttpClient {
  constructor(baseURL) {
    this.axios = axios.create({baseURL})
  }

  async setAuthorizationToken(accessToken, type = "Bearer") {
    this.axios.defaults.headers.common['Authorization'] = `${type} ${accessToken}`;
  }

  async makeRequest(options) {
    console.log("Sending request > " + this.axios.defaults.baseURL + options.url)
    return await this.axios(options);
  };

  async getRequest(url, headers) {
    const options = {
      method: "GET",
      url
    };
    let resp = await this.makeRequest(options);
    let stringified = JSON.stringify(resp.data);
    return JSON.parse(stringified);
  };

  async postRequest(url, data, auth, headers) {
    let options = {
      method: "POST",
      auth,
      data,
      headers,
      url
    };
    let resp = await this.makeRequest(options);
    let stringified = JSON.stringify(resp.data);
    return JSON.parse(stringified);
  };

  async putRequest(url, data, auth, headers) {
    let options = {
      method: "PUT",
      auth,
      data,
      headers,
      url
    };
    return await this.makeRequest(options);
  };
}

module.exports = HttpClient;
