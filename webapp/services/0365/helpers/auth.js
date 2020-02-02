const axios = require('axios'); //Make http calls
const qs = require('qs'); //Make json
const graph = require('@microsoft/microsoft-graph-client');

const credentials = {
  client: {
    id: process.env.APP_ID,
    secret: process.env.APP_PASSWORD,
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com/',
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: `${process.env.MS_TENANT}/oauth2/v2.0/token`
  },
};

async function getAccessToken() {
  const url = `${credentials.auth.tokenHost}${credentials.auth.tokenPath}`
  const postData = {
    client_id: process.env.APP_ID,
    scope: process.env.MS_GRAPH_SCOPE,
    client_secret: process.env.APP_PASSWORD,
    grant_type: process.env.GRANT_TYPE
  };

  const headerConfig = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  let response = await axios.post(url, qs.stringify(postData), headerConfig)
  if (response.error) {
    console.log('getAccessToken error:', error);
  } else {
    //console.log('getAccessToken token: ', response.data.access_token);
    return response.data.access_token;
  }
}

async function getGraphClient() {
  const accessToken = await getAccessToken();//Get Bearer access token to call Graph API
  if (accessToken) {
    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    return client;
  }
}

exports.getAccessToken = getAccessToken;
exports.getGraphClient = getGraphClient;
