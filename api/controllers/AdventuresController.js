/**
 * RulesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async give(req, res) {

    const id = parseInt(req.param('id'));
    let amount = 0;

    switch (id) {
      case 1:
        amount = 100;
        break;
      case 2:
        amount = 200;
        break;
      case 3:
        amount = 500;
        break;
      default:
        return res.notFound();
    }

    const payment = await sails.helpers.createPayment(
      amount,
      "Pourboire pour Drifter's Tales de la part de " + req.query['name'],
      "Un pouboire pour encourager le développement de Drifter's Tales. Merci à vous =)",
      process.env.WEBSITE_URL + "/drifters-tales/?give=cancel#give",
      process.env.WEBSITE_URL + "/drifters-tales/?give=success#give",
    );

    return res.send(payment.checkoutCode);
  },

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
      campaign: 'drifters-tales',
    });
    req.flash('mailingListMessage', "Vous avez été inscrit ! Merci !");
    return res.redirect('/drifters-tales');
  },

  async index(req, res) {
    return res.view(
      'pages/drifter-s-tales.ejs',
      {
        devlogs: await sails.models.devlog.find({product: 'drifters-tales'}),
        mailingListError: req.flash('mailingListError'),
        mailingListMessage: req.flash('mailingListMessage'),
        giveCancel: req.param('give') === 'cancel',
        giveSuccess: req.param('give') === 'success',
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

