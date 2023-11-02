const { default: axios } = require('axios');

module.exports = {

  inputs: {
    id: {
      type: 'string',
      required: true
    }
  },

  fn: async function(inputs, exits) {
    try {
      const baseUrl = process.env.CALENDAR_URL;
      const url = `${baseUrl}/cycles/${inputs.id}`;
      const result = await axios.get(url);
      const resultJson = result.data;
      return exits.success(resultJson);
    } catch (e) {
      console.log(e);
      return exits.success(false);
    }
  }
}
