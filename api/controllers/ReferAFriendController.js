/**
 * ReferAFriendController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {
    const refering = req.user_id ? await sails.helpers.getRef(req.user_id) : null;
    return res.view(
      'pages/refer.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        refering,
      }
    );
  },

  async code(req, res) {
    const refering = await sails.models.refer.findOne({code: req.param('code'), user: null});

    if (!refering) {
      return res.notFound();
    }

    return res.redirect(`/subscribe?refer=${refering.code}`);
  },

};

