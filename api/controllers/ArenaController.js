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
        ...await sails.helpers.layoutConfig(),
        windowsVersion: await sails.helpers.getAppVersion('windows'),
        macosVersion: await sails.helpers.getAppVersion('macos'),
        linuxVersion: await sails.helpers.getAppVersion('linux'),
      }
    );
  }

};

