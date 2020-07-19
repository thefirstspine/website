module.exports = {

  inputs: {
    referer: {
      type: 'string',
      required: true
    }
  },

  fn: async function(inputs, exits) {
    if (!inputs.referer) {
      return null;
    }

    const ref = await sails.models.refer.findOne({referer: inputs.referer});
    if (ref) {
      return exits.success(ref);
    }

    const code = Math.random().toString(36).substring(7);

    await sails.models.refer.create({
      code,
      referer: inputs.referer,
    });
    const createdRef = await sails.models.refer.findOne({referer: inputs.referer});

    return exits.success(createdRef);
  }
}
