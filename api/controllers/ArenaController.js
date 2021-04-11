/**
 * ArenaController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {
    return res.view(
      'pages/arena.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        title: "arena.playOnline",
        tags: [
          {
            type: 'property',
            name: 'og:url',
            value: req.baseUrl + req.url,
          },
          {
            type: 'property',
            name: 'og:type',
            value: 'website',
          },
          {
            type: 'property',
            name: 'og:title',
            value: 'The First Spine - ' + req.i18n.__('navigation.arena'),
          },
          {
            type: 'property',
            name: 'og:description',
            value: req.i18n.__("arena.introduction"),
          },
          {
            type: 'property',
            name: 'og:image',
            value: req.baseUrl + '/images/arena-0.png',
          },
        ],
      }
    );
  }

};

