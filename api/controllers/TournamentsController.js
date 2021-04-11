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
      tags: [
        {
          type: 'property',
          name: 'og:url',
          value: req.baseUrl + req.url,
        },
        {
          type: 'property',
          name: 'og:type',
          value: 'article',
        },
        {
          type: 'property',
          name: 'og:title',
          value: 'The First Spine - ' + tournament.title,
        },
        {
          type: 'property',
          name: 'og:description',
          value: (tournament.text.replace(/(<([^>]+)>)/ig,' ').slice(0, 120).split(' ').slice(0, -1).join(' ')) + '...',
        },
        {
          type: 'property',
          name: 'og:image',
          value: req.baseUrl + '/images/' + tournament.image,
        },
      ],
      ...await sails.helpers.layoutConfig(req.user_id),
    }
    
    // Init cache
    const cachedWizards = {};

    // User-relatd informations
    if (req.user_id) {
      // Get self registration
      const registration = await sails.models.tournamentregistration.findOne({tournamentId: tournament.id, userId: req.user_id});
      const matches = await sails.models.tournamentmatch.find({
        tournamentId: tournament.id,
        or: [
          { userId1: req.user_id },
          { userId2: req.user_id }
        ]
      });
      dataToView.registration = registration;
      // Get matches
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
      dataToView.matches = matchesConsolidated;
    }
    
    // Get ranked users
    const registrations = await sails.models.tournamentregistration.find({tournamentId: tournament.id});
    const registrationConsolidated = await Promise.all(registrations.map(async (reg) => {
      const regMatches = await sails.models.tournamentmatch.find({
        tournamentId: tournament.id,
        or: [
          { userId1: reg.userId },
          { userId2: reg.userId }
        ]
      });
      if (typeof cachedWizards[reg.userId] === "undefined") {
        const wizard1Response = await fetch(`${process.env.ARENA_REALMS_URL.replace('{realm}', 'sanctuaire')}/wizard/${reg.userId}`);
        const wizard1Json = await wizard1Response.json();
        cachedWizards[reg.userId] = wizard1Json;
      }
      reg.wizard = cachedWizards[reg.userId];
      const wins = regMatches.filter((m) => m.matchWinner === reg.userId && m.matchWinner !== null).length;
      const loses = regMatches.filter((m) => m.matchWinner !== reg.userId && m.matchWinner !== null).length;
      const noPlayed = regMatches.filter((m) => m.matchWinner === null).length;
      const points = wins * 3 + loses * 1;
      return {
        ...reg,
        wins,
        loses,
        noPlayed,
        points,
      };
    }));
    dataToView.rankedRegistrations = registrationConsolidated.sort((a, b) => {
      if (a.points < b.points) {
        return 1;
      }
      if (a.points > b.points) {
        return -1;
      }
      if (a.userId < b.userId) {
        return 1;
      }
    });

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

