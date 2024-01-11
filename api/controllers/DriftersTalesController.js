/**
 * RulesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async mailingList(req, res) {
    const email = req.body.email;

    if (
      !email ||
      !/^[^@ ]+@[^@ ]+\.[^@ ]+$/.test(email)
    )
    {
      req.flash('mailingListError', "Merci de rentrer une adresse valide.");
      return res.redirect('/drifters-tales');
    }

    const emails = await sails.models.mailinglist.find({
      email,
      campaign: 'drifters-tales',
    });
    if (emails.length > 0) {
      req.flash('mailingListError', "Vous avez déjà été inscrit.");
      return res.redirect('/drifters-tales');
    }

    await sails.models.mailinglist.create({
      email,
      campaign: 'drifters-tales-relaunch',
    });
    req.flash('mailingListMessage', "Vous avez été inscrit ! Merci !");
    return res.redirect('/drifters-tales');
  },

  async index(req, res) {
    return res.view(
      'pages/drifters-tales.ejs',
      {
        devlogs: [
          { youtubeId: 'AYdYcBRrje8' },
          { youtubeId: 'kTd0D3NbRrM' },
          { youtubeId: 'eRmVNS0-t0Q' },
        ],
        mailingListError: req.flash('mailingListError'),
        mailingListMessage: req.flash('mailingListMessage'),
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
            value: 'https://www.thefirstspine.fr' + '/images/og-characters2.jpg',
          },
        ],
      }
    );
  }

};

