module.exports = {
  fn: function() {
    return {
      solidPancakeUrl: sails.config.custom.dotenv.SOLID_PANCAKE_URL,
    };
  }
}