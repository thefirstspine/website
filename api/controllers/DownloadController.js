/**
 * DownloadController
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

  windows(req, res) {
    try {
      res.setHeader('Content-disposition', 'attachment; filename=the-first-spine-arena-setup.exe');
      const version = getVersion('windows');
      const filepath = `${BASE_DIR}/windows/app-${version}.exe`;
      if (!fs.existsSync(filepath)) {
        throw new Error("500");
      }
      const filestream = fs.createReadStream(filepath);
      filestream.pipe(res);
    } catch (e) {
      throw new Error("500");
    }
  },

  macos(req, res) {
    try {
      res.setHeader('Content-disposition', 'attachment; filename=the-first-spine-arena-setup.pkg');
      const version = getVersion('macos');
      const filepath = `${BASE_DIR}/macos/app-${version}.pkg`;
      if (!fs.existsSync(filepath)) {
        throw new Error("500");
      }
      const filestream = fs.createReadStream(filepath);
      filestream.pipe(res);
    } catch (e) {
      throw new Error("500");
    }
  },

  linux(req, res) {
    try {
      res.setHeader('Content-disposition', 'attachment; filename=the-first-spine-arena-setup.deb');
      const version = getVersion('linux');
      const filepath = `${BASE_DIR}/linux/app-${version}.deb`;
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

