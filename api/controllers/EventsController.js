/**
 * EventsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {
    // Getting internal events
    const internalEvents = await sails.models.event.find({
      sort: 'datetimeFrom ASC',
      where: {
        language: req.session.locale,
        datetimeTo: {'>': Date.now()},
      },
    });

    const eventsFromCalendar = await sails.helpers.getEvents();

    return res.view(
      'pages/events.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        title: 'events.title',
        events: [
          ...internalEvents,
          ...eventsFromCalendar.map(
            (event) => {
              event.type = `online:${event.type}`;
              return event;
            }
          ),
        ],
        gkey: process.env.GKEY,
      }
    );
  }

};

