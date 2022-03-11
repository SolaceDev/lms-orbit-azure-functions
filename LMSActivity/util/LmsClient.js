//
// LMS API Functions
//
const HttpClient = require('./HttpClient');
const qs = require('qs');

class LmsClient {
  constructor(baseUrl) {
    this.httpClient = new HttpClient(baseUrl);
  }

  async setAuthorizationToken(token) {
    this.httpClient.setAuthorizationToken(token);
  }

  async validateAccessToken() {
    try {
      await this.httpClient.getRequest("/manage/v1/user/13018");
      return true;
    } catch (err) {
      if (err.response != null && err.response.status == 401) {
        return false;
      }
      console.error(err);
      return false;
    }
  }

  async refreshAccessToken(refreshToken, clientId, clientSecret) {
    // Auth
    //
    let auth = {
      username: clientId,
      password: clientSecret
    }
    // Headers
    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    // Body
    let data = {
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    }

    // Send the request
    return await this.httpClient.postRequest("/oauth2/token", qs.stringify(data), auth, headers);
  }

  async getUser(userId) {
    return await this.httpClient.getRequest(`/manage/v1/user/${userId}`);
  }
}

module.exports = LmsClient;
