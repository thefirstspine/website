/**
 * RulesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {
    return res.view(
      'pages/drifter-s-tales.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        tags: [
          {
            type: 'property',
            name: 'og:url',
            value: 'https://www.thefirstspine.fr' + req.url,
          },
          {
            type: 'property',
            name: 'og:type',
            value: 'website',
          },
          {
            type: 'property',
            name: 'og:title',
            value: 'The First Spine - ' + req.i18n.__('navigation.driftersTales'),
          },
          {
            type: 'property',
            name: 'og:description',
            value: 'Les Contes du Vagabond est un jeu à paraître début 2022 sur PC.',
          },
          {
            type: 'property',
            name: 'og:image',
            value: 'https://www.thefirstspine.fr' + '/images/og-characters.png',
          },
        ],
      }
    );
  }

};

