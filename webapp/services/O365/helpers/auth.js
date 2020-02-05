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
    tokenPath: `${process.env.MS_TENANT}/oauth2/v2.0/token`,
    tokenPathNonTenant: 'common/oauth2/v2.0/token'
  },
};

//#region Tenant Access
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
//#endregion


//#region User Access
const oauth2 = require('simple-oauth2').create(credentials);
const jwt = require('jsonwebtoken');

function getAuthUrlUserAccess() {
  const returnVal = oauth2.authorizationCode.authorizeURL({
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.APP_SCOPES
  });
  console.log(`Generated auth url: ${returnVal}`);
  return returnVal;
}

async function getTokenFromCodeUserAccess(auth_code, res) {
  let result = await oauth2.authorizationCode.getToken({
    code: auth_code,
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.APP_SCOPES
  });

  const token = oauth2.accessToken.create(result);
  console.log('Token created: ', token.token);

  saveValuesToCookie(token, res);

  return token.token.access_token;
}

async function getAccessTokenUserAccess(cookies, res) {
  // Do we have an access token cached?
  let token = cookies.graph_access_token;

  if (token) {
    // We have a token, but is it expired?
    // Expire 5 minutes early to account for clock differences
    const FIVE_MINUTES = 300000;
    const expiration = new Date(parseFloat(cookies.graph_token_expires - FIVE_MINUTES));
    if (expiration > new Date()) {
      // Token is still good, just return it
      return token;
    }
  }

  // Either no token or it's expired, do we have a 
  // refresh token?
  const refresh_token = cookies.graph_refresh_token;
  if (refresh_token) {
    const newToken = await oauth2.accessToken.create({ refresh_token: refresh_token }).refresh();
    saveValuesToCookie(newToken, res);
    return newToken.token.access_token;
  }

  // Nothing in the cookies that helps, return empty
  return null;
}

function saveValuesToCookieUserAccess(token, res) {
  // Parse the identity token
  const user = jwt.decode(token.token.id_token);

  // Save the access token in a cookie
  res.cookie('graph_access_token', token.token.access_token, { maxAge: 3600000, httpOnly: true });
  // Save the user's name in a cookie
  res.cookie('graph_user_name', user.name, { maxAge: 3600000, httpOnly: true });
  // Save the refresh token in a cookie
  res.cookie('graph_refresh_token', token.token.refresh_token, { maxAge: 7200000, httpOnly: true });
  // Save the token expiration tiem in a cookie
  res.cookie('graph_token_expires', token.token.expires_at.getTime(), { maxAge: 3600000, httpOnly: true });
}

function clearCookies(res) {
  // Clear cookies
  res.clearCookie('graph_access_token', { maxAge: 3600000, httpOnly: true });
  res.clearCookie('graph_user_name', { maxAge: 3600000, httpOnly: true });
  res.clearCookie('graph_refresh_token', { maxAge: 7200000, httpOnly: true });
  res.clearCookie('graph_token_expires', { maxAge: 3600000, httpOnly: true });
}
//#endregion


exports.getAccessToken = getAccessToken;
exports.getGraphClient = getGraphClient;

exports.getAuthUrlUserAccess = getAuthUrlUserAccess;
exports.getAccessTokenUserAccess = getAccessTokenUserAccess;
exports.getTokenFromCodeUserAccess = getTokenFromCodeUserAccess;
exports.clearCookiesUserAccess = clearCookiesUserAccess;
