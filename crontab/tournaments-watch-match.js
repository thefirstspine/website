const { default: fetch } = require("node-fetch");

module.exports = {
  run: async function () {
    // Getting all the referrals
    const tournaments = await sails.models.tournament.find({
      registrationCloseAt: { '<' : Date.now() },
      tournamentCloseAt: { '>' : Date.now() },
    });

    await Promise.all(tournaments.map(async (tournament) => {
      sails.log(`Look if tournament #${tournament.id} is opened.`);
      const matches = await sails.models.tournamentmatch.find({
        tournamentId: tournament.id,
        matchWinner: null,
      });
      if (matches.length === 0) {
        sails.log(`Tournament #${tournament.id} is not opened.`);
        return;
      }

      await Promise.all(matches.map(async (match) => {
        sails.log(`Look for match #${match.id}`);
        sails.log(`Load user #${match.userId1}`);
        const wizardResponse = await fetch(`${process.env.ARENA_REALMS_URL.replace('{realm}', 'sanctuaire')}/wizard/${match.userId1}`);
        const wizardJson = await wizardResponse.json();
        const history = wizardJson.history.filter((h) => h.timestamp > match.createdAt);

        await Promise.all(history.map(async (gameHistory) => {
          const gameResponse = await fetch(`${process.env.ARENA_REALMS_URL.replace('{realm}', 'sanctuaire')}/api`, {
            method: "POST",
            body: JSON.stringify({
              "jsonrpc": "2.0",
              "method": "getGame",
              "id": gameHistory.gameId,
              "params": {
              }
            }),
            headers: {
              'Content-type': 'application/json'
            },
          });
          const gameJson = await gameResponse.json();
          if (typeof(gameJson.error) !== "undefined") {
            throw new Error(jsonResult.error.message);
          }

          if (gameJson.result.status === "active") {
            return;
          }
          
          const users = [
            gameJson.result.result[0].user,
            gameJson.result.result[1].user,
          ];
          if (
            gameJson.result.modifiers.join(',') === tournament.modifiers &&
            users.includes(parseInt(match.userId1)) && users.includes(parseInt(match.userId2))
          ) {
            if (gameJson.result.result[0].result === "win") {
              match.matchWinner = gameJson.result.result[0].user;
            }
            if (gameJson.result.result[1].result === "win") {
              match.matchWinner = gameJson.result.result[1].user;
            }
            sails.log(`User #${match.matchWinner} won the game #${gameJson.result.id}`);
            await sails.models.tournamentmatch.update({id: match.id}).set({
              ...match
            });
          }
        }));
      }));
      
      return;
    }));

    // Done
    sails.log(`End.`);
  }

};
