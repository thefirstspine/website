const fetch = require('node-fetch');

module.exports = {

  inputs: {
    access_token: {
      type: 'string',
      required: false
    }
  },

  fn: async function(inputs, exits) {
    // Main config 
    const config = {
      solidPancakeUrl: sails.config.custom.dotenv ?
        sails.config.custom.dotenv.SOLID_PANCAKE_URL :
        process.env.SOLID_PANCAKE_URL,
    };
    
    // On provided access token
    if (inputs.access_token) {
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
              'Authorization': `Bearer ${inputs.access_token}`,
            },
            method: 'GET',
          }
        );
        const resultJson = await result.json();
        if (resultJson.user_id) {
          config.user_id = resultJson;
        }
      } catch (e) {
        console.log(e);
      }
    }

    // On user ID available
    if (config.user_id) {
      // Load wizard here
    }

    return exits.success(config);
  }
}