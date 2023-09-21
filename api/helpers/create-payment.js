const { default: axios } = require("axios");

module.exports = {

  inputs: {
    itemPrice: {
      type: 'number',
      required: true
    },
    itemName: {
      type: 'string',
      required: true
    },
    itemDescription: {
      type: 'string',
      required: true
    },
    cancelUrl: {
      type: 'string',
      required: true
    },
    successUrl: {
      type: 'string',
      required: true
    },
  },

  fn: async function(inputs, exits) {
    try {
      const url = `${process.env.SHOP_URL}/purchase`;
      const response = await axios.post(url,
        {
          cancelUrl: inputs.cancelUrl,
          successUrl: inputs.successUrl,
          item: {
            price: inputs.itemPrice,
            name: inputs.itemName,
            description: inputs.itemDescription,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Cert': Buffer.from(process.env.SHOP_PUBLIC_KEY.replace(/\\n/gm, '\n')).toString('base64'),
          },
        }
      );
      const resultJson = response.data;
      return exits.success(resultJson);
    } catch (e) {
      console.log(e);
      return exits.success(false);
    }
  }
}
