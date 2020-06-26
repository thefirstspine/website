module.exports = {

  inputs: {
    user_id: {
      type: 'number',
      required: false,
    },
    locale: {
      type: 'string',
      required: false,
      default: 'fr',
    },
  },

  fn: async function(inputs, exits) {
    // Main config 
    const config = {
      solidPancakeUrl: process.env ?
        process.env.SOLID_PANCAKE_URL :
        process.env.SOLID_PANCAKE_URL,
      footer: {
        news: await sails.models.news.find({
          limit: 3,
          sort: 'createdAt DESC',
          where: {
            language: inputs.locale,
          },
        }),
      }
    };
    
    // On provided access token
    if (inputs.user_id) {
      config.user_id = inputs.user_id;
      // Load wizard here
    }

    return exits.success(config);
  }
}