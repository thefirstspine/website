/**
 * TournamentsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { default: fetch } = require("node-fetch");

module.exports = {

  async viewPage(req, res) {
    const tournament = await sails.models.tournament.findOne({slug: req.param('slug')});
    if (!tournament) {
      return res.notFound();
    }
    
    const dataToView = {
      tournament,
      ...await sails.helpers.layoutConfig(req.user_id),
    }

    if (req.user_id) {
      const registration = await sails.models.tournamentregistration.findOne({tournamentId: tournament.id, userId: req.user_id});
      const matches = await sails.models.tournamentmatch.find({tournamentId: tournament.id});
      const cachedWizards = {};
      const matchesConsolidated = await Promise.all(matches.map(async (match) => {
        if (typeof cachedWizards[match.userId1] === "undefined") {
          const wizard1Response = await fetch(`${process.env.ARENA_REALMS_URL.replace('{realm}', 'sanctuaire')}/wizard/${match.userId1}`);
          const wizard1Json = await wizard1Response.json();
          cachedWizards[match.userId1] = wizard1Json;
        }
        match.wizard1 = cachedWizards[match.userId1];
        if (typeof cachedWizards[match.userId2] === "undefined") {
          const wizard2Response = await fetch(`${process.env.ARENA_REALMS_URL.replace('{realm}', 'sanctuaire')}/wizard/${match.userId2}`);
          const wizard2Json = await wizard2Response.json();
          cachedWizards[match.userId2] = wizard2Json;
        }
        match.wizard2 = cachedWizards[match.userId2];
        return match;
      }));
      dataToView.registration = registration;
      dataToView.matches = matchesConsolidated;
    }

    return res.view(
      'pages/tournament',
      dataToView
    );
  },

  async register(req, res) {
    const tournament = await sails.models.tournament.findOne({slug: req.param('slug')});
    if (!tournament || tournament.registrationCloseAt < Date.now()) {
      return res.notFound();
    }

    if (!req.user_id) {
      return res.notFound();
    }

    const registration = await sails.models.tournamentregistration.findOne({tournamentId: tournament.id, userId: req.user_id});
    if (registration) {
      return res.notFound();
    }

    await sails.models.tournamentregistration.create({tournamentId: tournament.id, userId: req.user_id});

    return res.redirect(`/tournaments/${tournament.slug}`);
  }

};

