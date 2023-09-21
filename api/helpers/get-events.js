const { default: axios } = require("axios");

module.exports = {

  inputs: {
  },

  fn: async function(inputs, exits) {
    try {
      const baseUrl = process.env.CALENDAR_URL;
      const date = (new Date()).toISOString();
      const url = `${baseUrl}/events?filter=datetimeTo||gt||${date}&sort=datetimeFrom,ASC`;
      const result = await axios.get(url);
      const resultJson = await result.json();
      return exits.success(resultJson);
    } catch (e) {
      console.log(e);
      return exits.success(false);
    }
  }
}
