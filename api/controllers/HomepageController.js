/**
 * HomepageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fs = require('fs');

const BASE_DIR = '/data/dist_production';

const getVersion = function(plateform) {
  try {
    const path = `${BASE_DIR}/${plateform}/version`;
    return fs.readFileSync(path);
  } catch (e) {
    return false;
  }
};

module.exports = {

  async index(req, res) {
    return res.view(
      'pages/homepage.ejs',
      {
        windowsVersion: getVersion('windows'),
        macosVersion: getVersion('macos'),
        linuxVersion: getVersion('linux'),
      }
    );
  }

};

