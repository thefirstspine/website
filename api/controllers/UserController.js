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
        title: 'login.title',
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
        errors.push("login.error-wrongEmailOrPassword");
      }
    } catch (e) {
      errors.push("login.error-unavailable");
    }

    return res.view(
      'pages/login.ejs',
      {
        title: 'login.title',
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
    return res.view(
      'pages/subscribe.ejs',
      {
        title: 'subscribe.title',
        ...await sails.helpers.layoutConfig(req.user_id),
        redirect: req.query.redirect,
        errors: [],
        refering: req.query.refer ? await sails.models.refer.findOne({code: req.query.refer, user: null}) : null,
      }
    );
  },

  async submitSubscription(req, res) {
    const errors = [];

    if (req.body.conditions !== 'accept') {
      // No accept GCU
      errors.push("subscribe.error-cgu");
    } else {
      try {
        // Sign up
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
          // We had a response!
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
          const jsonLogin = await response.json();
          // Store referer (if provided)
          const refering = req.query.refer ? await sails.models.refer.findOne({code: req.query.refer, user: null}) : null;
          if (refering) {
            await sails.models.refer.update({
                code: req.query.refer,
                user: null,
              })
              .set({
                user: json.user_id,
              });
          }
          // Store the access token
          req.session.access_token = jsonLogin.access_token;
          // Redirect the user
          return res.redirect(req.query.redirect ? `/${req.query.redirect}` : '/profile');
        } else {
          errors.push("subscribe.error-check");
        }
      } catch (e) {
        console.log(e);
        errors.push("subscribe.error-unavailable");
      }
    }

    return res.view(
      'pages/subscribe.ejs',
      {
        title: 'subscribe.title',
        ...await sails.helpers.layoutConfig(req.user_id),
        redirect: req.query.redirect,
        errors,
        refering: req.query.refer ? await sails.models.refer.findOne({code: req.query.refer, user: null}) : null,
      }
    );
  },

  async viewForgottenPasswordForm(req, res) {
    const errors = [];

    return res.view(
      'pages/forgotten-password.ejs',
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

    messages.push('forgotten-password.message-sent');

    return res.view(
      'pages/forgotten-password.ejs',
      {
        title: 'forgotten-password.title',
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
      errors.push("profile.error-confirmationNotPatch");
    } else if (!req.body.password || req.body.password.length < 8) {
      errors.push("profile.error-length");
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
        errors.push("profile.error-unkown");
      } else {
        messages.push("profile.message-passwordChanged");
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
        title: 'profile.title',
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
        title: 'profile.title',
        ...await sails.helpers.layoutConfig(req.user_id),
        redirect: req.query.redirect,
        wizard,
        errors,
      }
    );
  }

};

