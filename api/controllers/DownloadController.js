/**
 * DownloadController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fs = require('fs');
const distDirectory = sails.config.custom.dotenv ?
  sails.config.custom.dotenv.DIST_DIRECTORY :
  process.env.DIST_DIRECTORY;

module.exports = {

  async windows(req, res) {
    try {
      res.setHeader('Content-disposition', 'attachment; filename=the-first-spine-arena-setup.exe');
      const version = await sails.helpers.getAppVersion('windows');
      const filepath = `${distDirectory}/windows/app-${version}.exe`;
      if (!fs.existsSync(filepath)) {
        throw new Error("500");
      }
      const filestream = fs.createReadStream(filepath);
      filestream.pipe(res);
    } catch (e) {
      throw new Error("500");
    }
  },

  async macos(req, res) {
    try {
      res.setHeader('Content-disposition', 'attachment; filename=the-first-spine-arena-setup.pkg');
      const version = await sails.helpers.getAppVersion('macos');
      const filepath = `${distDirectory}/macos/app-${version}.pkg`;
      if (!fs.existsSync(filepath)) {
        throw new Error("500");
      }
      const filestream = fs.createReadStream(filepath);
      filestream.pipe(res);
    } catch (e) {
      throw new Error("500");
    }
  },

  async linux(req, res) {
    try {
      res.setHeader('Content-disposition', 'attachment; filename=the-first-spine-arena-setup.deb');
      const version = await sails.helpers.getAppVersion('linux');
      const filepath = `${distDirectory}/linux/app-${version}.deb`;
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

