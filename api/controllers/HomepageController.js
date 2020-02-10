/**
 * HomepageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fs = require('fs');

const BASE_DIR = '/data/dist_production';

module.exports = {

  async index(req, res) {
    return res.view(
      'pages/homepage.ejs',
      {
        ...await sails.helpers.layoutConfig(),
        windowsVersion: await sails.helpers.getAppVersion('windows'),
        macosVersion: await sails.helpers.getAppVersion('macos'),
        linuxVersion: await sails.helpers.getAppVersion('linux'),
      }
    );
  }

};

