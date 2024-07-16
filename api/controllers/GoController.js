/**
 * CodesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { default: axios } = require("axios");

module.exports = {
  
  async index(req, res) {
    const code = req.params?.code;
    if (!code) {
      return res.redirect(301, '/');
    }

    const link = await sails.models.link.findOne({code});
    if (!link) {
      return res.redirect(301, '/');
    }

    await sails.models.linkclick.create({ code, ip: req.ip, userAgant: req.headers?['user-agent'] ?? req.headers['user-agent'] : 'unknown' });
    return res.redirect(301, link.url);
  },

};

