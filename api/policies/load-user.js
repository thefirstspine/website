const fetch = require('node-fetch');

module.exports = async function (req, res, proceed) {

  if (req.session.access_token) {
    
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
            'Authorization': `Bearer ${req.session.access_token}`,
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
