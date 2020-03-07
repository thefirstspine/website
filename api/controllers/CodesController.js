/**
 * CodesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
  async submit(req, res) {
    const code = req.body.code && req.body.code.length >= 12 ? req.body.code.replace(/-/g, '') : null;
    const codeEntity = await sails.models.code.findOne({code, user: null});

    if (!code) {
      return res.redirect('/codes');
    }
    
    if (!codeEntity) {
      return res.view(
        'pages/code-not-found',
        {
          ...await sails.helpers.layoutConfig(req.user_id)
        }
      );
    }

    if (req.user_id) {
      // Add the code to the profile
      return res.view(
        'pages/code-added',
        {
          ...await sails.helpers.layoutConfig(req.user_id),
          code: codeEntity,
        }
      );
    }

    // The user is not logged; display the landing page
      return res.view(
        'pages/code-to-add',
        {
          ...await sails.helpers.layoutConfig(req.user_id),
          code: codeEntity,
        }
      );
  },

  async viewForm(req, res) {
    return res.view(
      'pages/code-form',
      {
        ...await sails.helpers.layoutConfig(req.user_id)
      }
    );
  },

};

