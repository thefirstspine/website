/**
 * CodesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fetch = require('node-fetch');

module.exports = {
  
  async submit(req, res) {
    const code = req.body.code && req.body.code.length >= 12 ? req.body.code.replace(/-/g, '') : null;

    if (!code) {
      return res.redirect('/codes');
    }

    return res.redirect(`/codes/use/${code}`);
  },

  async useCode(req, res) {
    const codeEntity = await sails.models.code.findOne({code: req.param('code'), user: null});

    if (!codeEntity) {
      return res.view(
        'pages/code-not-found',
        {
          ...await sails.helpers.layoutConfig(req.user_id),
        }
      );
    }

    if (req.user_id) {
      // Add the code to the profile
      // Add the rewards to the user
      const promises = Object.keys(codeEntity.loots).map((lootName) => {
        return fetch(
          `${process.env.ARENA_URL}/wizzard/reward/${req.user_id}`,
          {
            method: 'POST',
            body: JSON.stringify({
              name: lootName,
              num: codeEntity.loots[lootName],
            }),
            headers: {
              'X-Client-Cert': Buffer.from(process.env.ARENA_PUBLIC_KEY.replace(/\\n/gm, '\n')).toString('base64'),
              'Content-type': 'application/json',
            },
          });
      });
      await Promise.all(promises);
      // Update the code
      await sails.models.code.update({id: codeEntity.id}).set({
        user: req.user_id,
      });
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

