/**
 * HomepageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {
    return res.view(
      'pages/homepage.ejs',
      {
        ...await sails.helpers.layoutConfig(req.session.access_token),
        windowsVersion: await sails.helpers.getAppVersion('windows'),
        macosVersion: await sails.helpers.getAppVersion('macos'),
        linuxVersion: await sails.helpers.getAppVersion('linux'),
        news: await sails.models.news.find({
          limit: 3,
          sort: 'createdAt DESC',
        }),
        currentCycle: await sails.helpers.getCycle('current'),
      }
    );
  }

};

