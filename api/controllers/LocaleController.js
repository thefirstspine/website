/**
 * RulesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async fr(req, res) {
    req.session.locale = "fr";
    return res.redirect("/");
  },

  async en(req, res) {
    req.session.locale = "en";
    return res.redirect("/");
  }

};

