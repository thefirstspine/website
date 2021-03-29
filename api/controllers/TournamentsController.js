/**
 * TournamentsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async viewPage(req, res) {
    const tournament = await sails.models.tournament.findOne({slug: req.param('slug')});
    if (!tournament) {
      return res.notFound();
    }

    const registration = req.user_id ? await sails.models.tournamentregistration.findOne({tournamentId: tournament.id, userId: req.user_id}) : null;

    return res.view(
      'pages/tournament',
      {
        tournament,
        registration,
        ...await sails.helpers.layoutConfig(req.user_id),
      }
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

