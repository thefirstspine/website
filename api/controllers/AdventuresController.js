/**
 * RulesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {
    return res.view(
      'pages/drifter-s-tales.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
      }
    );
  }

};

