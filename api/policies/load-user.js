const fetch = require('node-fetch');

module.exports = async function (req, res, proceed) {

  let accessToken = null;

  if (req.session.access_token) {
    accessToken = req.session.access_token;
  }

  if (req.headers.authorization) {
    accessToken = req.headers.authorization.replace(/Bearer /, '');
  }

  // Get base URL for service
  const baseUrl = process.env.AUTH_URL;

  if (accessToken) {
    // Try to retrieve the user with the token
    try {
      const result = await fetch(
        `${baseUrl}/api/me`,
        {
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          method: 'GET',
        }
      );
      const resultJson = await result.json();
      if (resultJson.user_id) {
        req.user_id = resultJson.user_id; // store user ID for future purposes
      }
    } catch (e) {
      console.log(e);
    }

    // Decode access token
    try {
      const jwtPayload = accessToken.split('.')[1];
      const decodedJwtPayload = Buffer.from(jwtPayload, 'base64').toString();
      const jsonJwtPayload = JSON.parse(decodedJwtPayload);

      // On a token too old (more than 6 hours), refresh the token
      if ((Date.now() - (jsonJwtPayload.iat * 1000)) > (6 * 60 * 60 * 1000)) {
        const result = await fetch(
          `${baseUrl}/api/refresh`,
          {
            headers: {
              'Content-type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            method: 'POST',
          }
        );
        const resultJson = await result.json();
        if (resultJson.access_token) {
          req.session.access_token = accessToken = resultJson.access_token; // store the refreshed access token
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  return proceed();
};
