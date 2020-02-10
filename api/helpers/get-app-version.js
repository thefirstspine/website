const fs = require('fs');
const distDirectory = sails.config.custom.dotenv ?
  sails.config.custom.dotenv.DATA + 'dist_production' :
  process.env.DATA + 'dist_production';

module.exports = {

  inputs: {
    plateform: {
      type: 'string',
      required: true
    }
  },

  fn: function(inputs, exits) {
    try {
      const path = `${distDirectory}/${inputs.plateform}/version`;
      return exits.success(fs.readFileSync(path));
    } catch (e) {
      return exits.success(false);
    }
  }
}
