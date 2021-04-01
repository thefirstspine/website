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
      });
      if (matches.length > 0) {
        sails.log(`Tournament #${tournament.id} is already opened.`);
        return;
      }

      sails.log(`Generate matches`);
      const registrations = await sails.models.tournamentregistration.find({
        tournamentId: tournament.id,
      });
      const matchesToCreate = [];
      while(registrations.length > 1) {
        for (let i = 1; i < registrations.length; i ++) {
          const userId1 = registrations[0].userId;
          const userId2 = registrations[i].userId;
          sails.log(`Match generated: #${userId1} VS #${userId2}`);
          matchesToCreate.push({
            userId1,
            userId2,
            tournamentId: tournament.id,
          });
        }
        registrations.shift();
      }
      await Promise.all(matchesToCreate.map((m) => sails.models.tournamentmatch.create(m)));

      sails.log(`Create room tournament-${tournament.id}`);
      const result = await sails.helpers.createRoom(`tournament-${tournament.id}`);
      sails.log(result);
      
      return;
    }));
  }

};
