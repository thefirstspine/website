module.exports = {
  fn: function() {
    return {
      solidPancakeUrl: sails.config.custom.dotenv ?
        sails.config.custom.dotenv.SOLID_PANCAKE_URL :
        process.env.SOLID_PANCAKE_URL,
    };
  }
}