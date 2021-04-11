/**
 * AboutController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {
    return res.view(
      'pages/about.ejs',
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
            value: 'The First Spine - ' + req.i18n.__('navigation.about'),
          },
          {
            type: 'property',
            name: 'og:description',
            value: req.i18n.__("about.howWePlayText1") + req.i18n.__("about.howWePlayText2") + req.i18n.__("about.howWePlayText3"),
          },
          {
            type: 'property',
            name: 'og:image',
            value: 'https://www.thefirstspine.fr' + '/images/the-fox.png',
          },
        ],
      }
    );
  }

};

