module.exports = {

  inputs: {
    plateform: {
      type: 'string',
      required: true
    }
  },

  fn: function(inputs, exits) {
    try {
      const path = `${BASE_DIR}/${inputs.plateform}/version`;
      return exits.success(fs.readFileSync(path));
    } catch (e) {
      return exits.success(false);
    }
  }
}
