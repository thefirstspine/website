const { default: axios } = require("axios");

module.exports = {

  inputs: {
    name: {
      type: 'string',
      required: true
    }
  },

  fn: async function(inputs, exits) {
    try {
      const url = `${process.env.ROOMS_URL}/api/subjects/arena/rooms`;
      const response = await axios.post(url, {
        body: JSON.stringify({
          name: inputs.name,
          senders: [],
        }),
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Cert': Buffer.from(process.env.ROOMS_PUBLIC_KEY.replace(/\\n/gm, '\n')).toString('base64'),
        },
      });
      const resultJson = await response.json();
      return exits.success(resultJson);
    } catch (e) {
      console.log(e);
      return exits.success(false);
    }
  }
}
