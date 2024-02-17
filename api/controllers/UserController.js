/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { default: axios } = require("axios");

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
      const response = await axios.post(
        `${process.env.AUTH_URL}/api/v2/login`,
        {
          email: req.body.email,
          password: req.body.password,
        }
      );
      const json = response.data;
      if (json.access_token) {
        req.session.access_token = json.access_token;
        return res.redirect(req.query.redirect ? `/${req.query.redirect}` : '/profile');
      } else {
        errors.push("login.error-wrongEmailOrPassword");
      }
    } catch (e) {
      console.log({ errorFromAxios: e});
      if (e?.response?.status == 401) {
        errors.push("login.error-wrongEmailOrPassword");
      } else if (e?.response?.data?.message) {
        errors.push(e?.response?.data?.message);
      } else {
        errors.push("login.error-unavailable");
      }
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
    const response = await axios.post(
      `${process.env.AUTH_URL}/api/v2/login-with-facebook`,
      {
        code: req.query.code,
        redirect_uri: 'https://www.thefirstspine.fr/login-with-facebook',
      },
    );

    const responseJson = response.data;
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
        const response = await axios.post(
          `${process.env.AUTH_URL}/api/v2/signup`,
          {
            email: req.body.email,
            password: req.body.password,
          },
        );
        const json = response.data;
        if (json.user_id) {
          // We had a response!
          const response = await axios.post(
            `${process.env.AUTH_URL}/api/v2/login`,
            {
              email: req.body.email,
              password: req.body.password,
            },
          );
          const jsonLogin = response.data;
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
        console.log({ errorFromAxios: e});
        if (e?.response?.status == 401) {
          errors.push("login.error-wrongEmailOrPassword");
        } else if (e?.response?.status == 400) {
          errors.push("subscribe.error-check");
        } else if (e?.response?.data?.message) {
          errors.push(e?.response?.data?.message);
        } else {
          errors.push("login.error-unavailable");
        }
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

    await axios.post(
      `${process.env.AUTH_URL}/api/v2/reset-password`,
      {
        email: req.body.email,
      },
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
      const response = await axios.put(
        `${process.env.AUTH_URL}/api/v2/me`,
        {
          password: req.body.password,
        },
        {
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${req.session.access_token}`,
          },
        },
      );
      if (response.status >= 400) {
        errors.push("profile.error-unkown");
      } else {
        messages.push("profile.message-passwordChanged");
      }
    }
    
    const response = await axios.get(
      `${process.env.ARENA_REALMS_URL.replace('{realm}', 'sanctuaire')}/wizard/me`,
      {
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${req.session.access_token}`,
        },
      }
    );
    const wizard = response.data;

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

    const response = await axios.get(
      `${process.env.ARENA_REALMS_URL.replace('{realm}', 'sanctuaire')}/wizard/me`,
      {
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${req.session.access_token}`,
        },
      }
    );
    const wizard = response.data;

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

