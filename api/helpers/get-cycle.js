const fetch = require('node-fetch');

module.exports = {

  inputs: {
    id: {
      type: 'string',
      required: true
    }
  },

  fn: async function(inputs, exits) {
    try {
      const baseUrl = sails.config.custom.dotenv ?
        sails.config.custom.dotenv.REST_URL :
        process.env.REST_URL;
      const url = `${baseUrl}/rest/cycles/${inputs.id}`;
      const result = await fetch(url);
      const resultJson = await result.json();
      return exits.success(resultJson);
    } catch (e) {
      console.log(e);
      return exits.success(false);
    }
  }
}
