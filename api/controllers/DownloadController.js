/**
 * DownloadController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  windows(req, res) {
    try {
      res.setHeader('Content-disposition', 'attachment; filename=the-first-spine-arena-setup.exe');
      const version = await sails.helpers.getAppVersion('windows');
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
      const version = await sails.helpers.getAppVersion('macos');
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
      const version = await sails.helpers.getAppVersion('linux');
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

