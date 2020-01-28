/**
 * DownloadController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fs = require('fs');
const yaml = require('js-yaml');

//const BASE_DIR = '/data/dist_production';
const BASE_DIR = `${__dirname}/../../dist_production`;

const getVersion = function() {
  const path = `${BASE_DIR}/version`;
  return fs.readFileSync(path);
};

const getLatestBuildInfos = function() {
  const path = `${BASE_DIR}/info-latest.yml`;
  const doc = yaml.safeLoad(fs.readFileSync(path));
  return doc;
};

module.exports = {

  windows(req, res) {
    res.setHeader('Content-disposition', 'attachment; filename=the-first-spine-arena-setup.exe');
    const version = getVersion();
    const filepath = `${BASE_DIR}/app-${version}.exe`;
    const filestream = fs.createReadStream(filepath);
    filestream.pipe(res);
  },

  apple(req, res) {
    res.setHeader('Content-disposition', 'attachment; filename=the-first-spine-arena-setup.app');
    const version = getVersion();
    const filepath = `${BASE_DIR}/app-${version}.app`;
    const filestream = fs.createReadStream(filepath);
    filestream.pipe(res);
  },

};

