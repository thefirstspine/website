const { default: axios } = require("axios");

module.exports = {

  inputs: {
  },

  fn: async function(inputs, exits) {
    try {
      const baseUrl = process.env.CALENDAR_URL;
      const date = (new Date()).toISOString();
      const url = `${baseUrl}/events/next`;
      const result = await axios.get(url);
      const resultJson = result.data;
      return exits.success(resultJson);
    } catch (e) {
      console.log(e);
      return exits.success(false);
    }
  }
}
