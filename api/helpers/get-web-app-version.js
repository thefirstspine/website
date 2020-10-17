const fetch = require('node-fetch');

module.exports = {

  inputs: {
    plateform: {
      type: 'string',
      required: true
    }
  },

  fn: async function(inputs, exits) {
    try {
      const path = `https://${inputs.plateform}.thefirstspine.fr/version`;
      const response = await fetch(path);
      const version = await response.text();
      return exits.success(version);
    } catch (e) {
      return exits.success(false);
    }
  }
}
