/**
 * RulesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async steamCode(req, res) {
    // Antispam
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const alreadyRequestedCodesForIp = await sails.models.steamcode.find({
      where: {
        product: 'drifters-tales-relaunch-demo',
        ipAddress,
      },
      limit: 10,
    });
    if (alreadyRequestedCodesForIp.length >= 4) {
      req.flash('steamCodeError', 'driftersTales.spamError');
      return res.redirect('/drifters-tales#demo');
    }

    // Get entity
    const entity = await sails.models.steamcode.find({
      where: {
        used: false,
        product: 'drifters-tales-relaunch-demo',
      },
      limit: 1,
    });
    if (entity.length == 0) {
      req.flash('steamCodeError', 'driftersTales.notEnoughCodes');
      return res.redirect('/drifters-tales#demo');
    }

    await sails.models.steamcode.updateOne({ id: entity[0].id }, { used: true, ipAddress });
    req.flash('steamCode', entity[0].code);
    req.flash('steamCodeMessage', 'driftersTales.demoCode');
    return res.redirect('/drifters-tales#demo');
  },

  async mailingList(req, res) {
    const email = req.body.email;

    if (
      !email ||
      !/^[^@ ]+@[^@ ]+\.[^@ ]+$/.test(email)
    )
    {
      req.flash('mailingListError', 'driftersTales.invalidEmail');
      return res.redirect('/drifters-tales#mailinglist');
    }

    const emails = await sails.models.mailinglist.find({
      email,
      campaign: 'drifters-tales-relaunch',
    });
    if (emails.length > 0) {
      req.flash('mailingListError', 'driftersTales.alreadyRegistered');
      return res.redirect('/drifters-tales#mailinglist');
    }

    await sails.models.mailinglist.create({
      email,
      campaign: 'drifters-tales-relaunch',
    });
    req.flash('mailingListMessage', 'driftersTales.registered');
    return res.redirect('/drifters-tales#mailinglist');
  },

  async index(req, res) {
    const mailingListError = req.flash('mailingListError');
    const mailingListMessage = req.flash('mailingListMessage');
    const steamCodeError = req.flash('steamCodeError');
    const steamCodeMessage = req.flash('steamCodeMessage');
    const steamCode = req.flash('steamCode');
    return res.view(
      'pages/drifters-tales.ejs',
      {
        devlogs: [
          { youtubeId: 'ILz9mu43RNA' },
          { youtubeId: 'azJsiV2W-Q0' },
          { youtubeId: 'b2KAqQknR9I' },
          { youtubeId: 'l0mOjg59o-I' },
          { youtubeId: '_5xXhNdXrPE' },
        ],
        mailingListError: mailingListError.length > 0 ? mailingListError : null,
        mailingListMessage: mailingListMessage.length > 0 ? mailingListMessage : null,
        steamCodeError: steamCodeError.length > 0 ? steamCodeError : null,
        steamCodeMessage: steamCodeMessage.length > 0 ? steamCodeMessage : null,
        steamCode: steamCode.length > 0 ? steamCode : null,
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

