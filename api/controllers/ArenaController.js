/**
 * ArenaController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {
    return res.view(
      'pages/arena.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        title: "arena.playOnline",
        /*
        browserVersion: await sails.helpers.getWebAppVersion('play'),
        mobileVersion: await sails.helpers.getWebAppVersion('play.m'),
        */
      }
    );
  }

};

