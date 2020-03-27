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
        title: 'Connexion',
        ...await sails.helpers.layoutConfig(req.user_id),
        redirect: req.query.redirect,
      }
    );
  },

  async tryLogin(req, res) {
    const errors = [];

    try {
      const response = await fetch(
        `${process.env.AUTH_URL}/api/login`,
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
        return res.redirect(req.query.redirect ? `/${req.query.redirect}` : '/profile');
      } else {
        errors.push(`Adresse e-mail ou mot de passe incorrecte.`);
      }
    } catch (e) {
      errors.push(`Le système de connexion n'est actuellement pas disponible.`);
    }

    return res.view(
      'pages/login.ejs',
      {
        title: 'Connexion',
        ...await sails.helpers.layoutConfig(req.user_id),
        redirect: req.query.redirect,
        errors,
      }
    );
  },

  async tryLoginWithFacebook(req, res) {
    const response = await fetch(
      `${process.env.AUTH_URL}/api/login-with-facebook`, {
        method: 'post',
        body: JSON.stringify({
          code: req.query.code,
          redirect_uri: 'https://www.thefirstspine.fr/login-with-facebook',
        }),
        headers: {
          'Content-type': 'application/json',
        },
      });

    const responseJson = await response.json();
    if (response.status >= 400) {
      return res.redirect('/login');
    }

    req.session.access_token = responseJson.access_token;
    return res.redirect(req.query.redirect ? `/${req.query.redirect}` : '/profile');
  },

  async logout(req, res) {
    req.session.access_token = null;
    return res.redirect('/');
  },

  async viewSubscriptionForm(req, res) {
    const errors = [];

    return res.view(
      'pages/subscribe.ejs',
      {
        title: 'Inscription',
        ...await sails.helpers.layoutConfig(req.user_id),
        redirect: req.query.redirect,
        errors,
      }
    );
  },

  async submitSubscription(req, res) {
    const errors = [];

    if (req.body.conditions !== 'accept') {
      errors.push(`Veuillez accepter les conditions d'utilisation.`);
    } else {
      try {
        const response = await fetch(
          `${process.env.AUTH_URL}/api/signup`,
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
        if (json.user_id) {
          const response = await fetch(
            `${process.env.AUTH_URL}/api/login`,
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
          req.session.access_token = json.access_token;
          return res.redirect(req.query.redirect ? `/${req.query.redirect}` : '/profile');
        } else {
          errors.push(`Oups, votre inscription n'a pas pu se faire. Vérifiez vos informations.`);
        }
      } catch (e) {
        console.log(e);
        errors.push(`Le système d'inscription n'est actuellement pas disponible.`);
      }
    }

    return res.view(
      'pages/subscribe.ejs',
      {
        title: 'Inscription',
        ...await sails.helpers.layoutConfig(req.user_id),
        redirect: req.query.redirect,
        errors,
      }
    );
  },

  async viewForgottenPasswordForm(req, res) {
    const errors = [];

    return res.view(
      'pages/forgottent-password.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        redirect: req.query.redirect,
        errors,
      }
    );
  },

  async sendNewPassword(req, res) {
    const errors = [];
    const messages = [];

    await fetch(
      `${process.env.AUTH_URL}/api/password-lost`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          email: req.body.email,
        }),
      }
    );

    messages.push('Votre mot de passe vous a été envoyé !');

    return res.view(
      'pages/forgottent-password.ejs',
      {
        title: 'Mot de passe perdu',
        ...await sails.helpers.layoutConfig(req.user_id),
        redirect: req.query.redirect,
        errors,
        messages,
      }
    );
  },

  async editProfile(req, res) {
    const errors = [];
    const messages = [];

    if (req.body.password !== req.body.password2) {
      errors.push(`Les mots de passe ne correspondent pas.`);
    } else if (!req.body.password || req.body.password.length < 8) {
      errors.push(`Le mot de passe doit avoir au moins 8 caractères.`);
    } else {
      const response = await fetch(
        `${process.env.AUTH_URL}/api/me`,
        {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${req.session.access_token}`,
          },
          body: JSON.stringify({
            password: req.body.password,
          }),
        }
      );
      if (response.status >= 400) {
        errors.push(`Le changement de mot de passe a échoué.`);
      } else {
        messages.push(`Le mot de passe a été modifié.`);
      }
    }
    

    const response = await fetch(
      `${process.env.ARENA_URL}/wizzard`,
      {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${req.session.access_token}`,
        },
      }
    );
    const wizard = await response.json();

    return res.view(
      'pages/profile.ejs',
      {
        title: 'Profil',
        ...await sails.helpers.layoutConfig(req.user_id),
        redirect: req.query.redirect,
        wizard,
        errors,
        messages,
      }
    );
  },

  async viewProfile(req, res) {
    const errors = [];

    const response = await fetch(
      `${process.env.ARENA_URL}/wizzard`,
      {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${req.session.access_token}`,
        },
      }
    );
    const wizard = await response.json();

    return res.view(
      'pages/profile.ejs',
      {
        title: 'Profil',
        ...await sails.helpers.layoutConfig(req.user_id),
        redirect: req.query.redirect,
        wizard,
        errors,
      }
    );
  }

};

