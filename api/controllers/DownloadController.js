/**
 * DownloadController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fs = require('fs');
const yaml = require('js-yaml');

const BASE_DIR = '/data/dist_production';

const getVersion = function() {
  try {
    const path = `${BASE_DIR}/version`;
    return fs.readFileSync(path);
  } catch (e) {
    return 'unknown';
  }
};

module.exports = {

  windows(req, res) {
    try {
      res.setHeader('Content-disposition', 'attachment; filename=the-first-spine-arena-setup.exe');
      const version = getVersion();
      const filepath = `${BASE_DIR}/app-${version}.exe`;
      if (!fs.existsSync(filepath)) {
        throw new Error("500");
      }
      const filestream = fs.createReadStream(filepath);
      filestream.pipe(res);
    } catch (e) {
      throw new Error("500");
    }
  },

  apple(req, res) {
    try {
      res.setHeader('Content-disposition', 'attachment; filename=the-first-spine-arena-setup.app');
      const version = getVersion();
      const filepath = `${BASE_DIR}/app-${version}.app`;
      if (!fs.existsSync(filepath)) {
        throw new Error("500");
      }
      const filestream = fs.createReadStream(filepath);
      filestream.pipe(res);
    } catch (e) {
      throw new Error("500");
    }
  },

};

