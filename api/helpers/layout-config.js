module.exports = {

  inputs: {
    user_id: {
      type: 'number',
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
    if (inputs.user_id) {
      config.user_id = inputs.user_id;
      // Load wizard here
    }

    return exits.success(config);
  }
}