/**
 * TournamentsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { default: fetch } = require("node-fetch");

module.exports = {

  /**
   * Main page viewer for tournaments
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  async viewPage(req, res) {
    // Is tournament exist?
    const tournament = await sails.models.tournament.findOne({slug: req.param('slug')});
    if (!tournament) {
      return res.notFound();
    }
    
    // Construct data to pass to the renderer
    const dataToView = {
      tournament,
      ...await sails.helpers.layoutConfig(req.user_id),
    }

    // User-relatd informations
    if (req.user_id) {
      const registration = await sails.models.tournamentregistration.findOne({tournamentId: tournament.id, userId: req.user_id});
      const matches = await sails.models.tournamentmatch.find({
        tournamentId: tournament.id,
        or: [
          { userId1: req.user_id },
          { userId2: req.user_id }
        ]
      });
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

    // Render
    return res.view(
      'pages/tournament',
      dataToView
    );
  },

  /**
   * Register a user to a tournament
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  async register(req, res) {
    // Is the tournament exist?
    const tournament = await sails.models.tournament.findOne({slug: req.param('slug')});
    if (!tournament || tournament.registrationCloseAt < Date.now()) {
      return res.notFound();
    }

    // Only logged users can access this
    if (!req.user_id) {
      return res.notFound();
    }

    // Register user
    const registration = await sails.models.tournamentregistration.findOne({tournamentId: tournament.id, userId: req.user_id});
    if (registration) {
      return res.notFound();
    }
    await sails.models.tournamentregistration.create({tournamentId: tournament.id, userId: req.user_id});

    // Redirect
    return res.redirect(`/tournaments/${tournament.slug}`);
  },

  /**
   * Create a queue in TFS Arena
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  async createMatchCode(req, res) {
    // Is the tournament exist?
    const tournament = await sails.models.tournament.findOne({slug: req.param('slug')});
    if (!tournament || tournament.tournamentCloseAt < Date.now()) {
      return res.notFound();
    }
    
    // Is the match exist?
    const tournamentmatch = await sails.models.tournamentmatch.findOne({id: req.param('id')});
    if (!tournamentmatch || (tournamentmatch.userId1 !== req.user_id.toString() && tournamentmatch.userId2 !== req.user_id.toString())) {
      return res.notFound();
    }

    // Is the code already generated?
    if (tournamentmatch.matchCode && tournamentmatch.matchCodeExpiresAt > Date.now()) {
      return res.json(tournamentmatch);
    }

    // Create the queue in TFS
    const creationData = {
      "jsonrpc": "2.0",
      "method": "createQueue",
      "params": {
        "gameTypeId": "standard",
        "theme": tournament.theme,
        "modifiers": tournament.modifiers.split(','),
      }
    };
    const result = await fetch(`${process.env.ARENA_REALMS_URL.replace('{realm}', tournament.realm)}/api`, {
      method: "POST",
      body: JSON.stringify(creationData),
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${req.session.access_token}`,
      },
    });
    const jsonResult = await result.json();
    if (typeof(jsonResult.error) !== "undefined") {
      throw new Error(jsonResult.error.message);
    }

    // Update entity
    tournamentmatch.matchCodeExpiresAt = jsonResult.result.expiresAt;
    tournamentmatch.matchCode = jsonResult.result.key;
    await sails.models.tournamentmatch.update({id: tournamentmatch.id}).set({
      ...tournamentmatch
    });

    // Send information
    return res.json(tournamentmatch);
  }

};

