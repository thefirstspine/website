/**
 * DownloadController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

 const fs = require('fs');

module.exports = {
  
  async windows(req, res) {
    res.setHeader('Content-disposition', 'attachment; filename=the-first-spine-arena-setup.exe');
    let filestream = fs.createReadStream('/data/app.exe');
    filestream.pipe(res);
  }

};

