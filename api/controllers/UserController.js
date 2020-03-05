/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fetch = require('node-fetch');

module.exports = {

  async viewLoginForm(req, res) {
    return res.view(
      'pages/login.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
      }
    );
  },

  async tryLogin(req, res) {
    const errors = [];

    try {
      const baseUrl = sails.config.custom.dotenv ?
        sails.config.custom.dotenv.AUTH_URL :
        process.env.AUTH_URL;
      const response = await fetch(
        `${baseUrl}/api/login`,
        {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            email: req.body.email,
            password: req.body.password,
          }),
        }
      );
      const json = await response.json();
      if (json.access_token) {
        req.session.access_token = json.access_token;
        return res.redirect('/profile');
      } else {
        errors.push(`Adresse e-mail ou mot de passe incorrecte.`);
      }
    } catch (e) {
      errors.push(`Le système de connextion n'est actuellement pas disponible.`);
    }

    return res.view(
      'pages/login.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        errors,
      }
    );
  },

  async viewSubscriptionForm(req, res) {
    const errors = [];

    if (req.method === 'POST') {
    }

    return res.view(
      'pages/subscribe.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        errors,
      }
    );
  },

  async viewProfile(req, res) {
    const errors = [];

    if (req.method === 'POST') {
    }

    return res.view(
      'pages/profile.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        errors,
      }
    );
  }

};

