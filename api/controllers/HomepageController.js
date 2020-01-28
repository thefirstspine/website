/**
 * HomepageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fs = require('fs');

const BASE_DIR = '/data/dist_production';
//const BASE_DIR = `${__dirname}/../../dist_production`;

const getVersion = function() {
  const path = `${BASE_DIR}/version`;
  return fs.readFileSync(path);
};

module.exports = {

  async index(req, res) {
    return res.view(
      'pages/homepage.ejs',
      {
        version: getVersion(),
      }
    );
  }

};

