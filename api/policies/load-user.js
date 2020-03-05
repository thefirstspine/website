const fetch = require('node-fetch');

module.exports = async function (req, res, proceed) {

  let accessToken = null;

  if (req.session.access_token) {
    accessToken = req.session.access_token;
  }

  if (req.headers.authorization) {
    accessToken = req.headers.authorization.replace(/Bearer /, '');
  }

  if (accessToken) {
    
    try {
      const baseUrl = sails.config.custom.dotenv ?
        sails.config.custom.dotenv.AUTH_URL :
        process.env.AUTH_URL;
      const url = `${baseUrl}/api/me`;
      const result = await fetch(
        url,
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
  }

  return proceed();
};
