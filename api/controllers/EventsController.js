/**
 * EventsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {
    const events = await sails.models.event.find({
      sort: 'datetimeFrom ASC',
      where: {
        language: req.session.locale,
        datetimeTo: {'>': Date.now()},
      },
    });

    return res.view(
      'pages/events.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        title: 'events.title',
        events,
        gkey: process.env.GKEY,
      }
    );
  }

};

