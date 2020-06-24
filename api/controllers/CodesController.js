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
    const getCodeOrSecretCode = async (code, user) => {
      // Find secret code
      const secretCode = process.env.SECRET_CODES.split(',').find((secretCode) => {
        const fragments = secretCode.split('?');
        if (fragments[0] === code) {
          return true;
        }
      });
      // If the code is secret, find if it was used by the user
      if (secretCode) {
        const loots = JSON.parse(secretCode.split('?')[1]);
        if (!user) {
          const checkCodeEntity = await sails.models.code.findOne({code, user: null});
          if (!checkCodeEntity) {
            await sails.models.code.create({code, user: null, loots});
          }
        } else {
          const secretCodeEntity = await sails.models.code.findOne({code, user});
          // The user was found, skip find
          if (secretCodeEntity) {
            return undefined;
          }
          const checkCodeEntity = await sails.models.code.findOne({code, user: null});
          if (!checkCodeEntity) {
            await sails.models.code.create({code, user: null, loots});
          }
        }
      }

      // If not, find not used in code database
      const codeEntity = await sails.models.code.find({code, user: null});
      return codeEntity.length > 0 ? codeEntity[0] : undefined;
    }

    // Find the code
    const codeEntity = await getCodeOrSecretCode(req.param('code'), req.user_id);

    // Render error on code not found
    if (!codeEntity) {
      return res.view(
        'pages/code-not-found',
        {
          ...await sails.helpers.layoutConfig(req.user_id),
          title: 'Entrez un code obtenu lors d\'un événement',
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
          title: 'Entrez un code obtenu lors d\'un événement',
          code: codeEntity,
        }
      );
    }

    // The user is not logged; display the landing page
    return res.view(
      'pages/code-to-add',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        title: 'Entrez un code obtenu lors d\'un événement',
        code: codeEntity,
      }
    );
  },

  async viewForm(req, res) {
    return res.view(
      'pages/code-form',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        title: 'Entrez un code obtenu lors d\'un événement',
      }
    );
  },

};

