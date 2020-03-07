/**
 * HomepageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {

    /**
     * Get a loot array & flat it to an object.
     * @param {*} rewards 
     */
    const flatmapRewards = function(rewards) {
      const ret = {};
      rewards.forEach((rewardForPlayer) => {
        const isHolo = /^holo-/.test(rewardForPlayer.name);
        const isPremium = /^premium-/.test(rewardForPlayer.name);
        const cardId = rewardForPlayer.name.replace(/^holo-/, '').replace(/^premium-/, '');
        ret[cardId] = {
          isHolo: ret[cardId] ? ret[cardId].isHolo || isHolo : isHolo,
          isPremium: ret[cardId] ? ret[cardId].isPremium || isPremium : isPremium,
        };
      });
      return ret;
    };
  
    /**
     * Construct a card object ready to display
     * @param {*} cardId 
     * @param {*} isHolo 
     * @param {*} isPremium 
     */
    const constructCardForDisplay = function(cardId, isHolo, isPremium) {
      return {
        cardId,
        isHolo,
        isPremium,
      };
    };

    // Get the current cycle
    const currentCycle =  await sails.helpers.getCycle('current');

    // Map the rewards
    const rewardsForPlayersMap = flatmapRewards(currentCycle.rewardsForPlayers);
    const rewardsForWinnerMap = flatmapRewards(currentCycle.rewardsForWinner);

    // Get the cards for the rewards
    const cardsRewardsForPlayers = Object.keys(rewardsForPlayersMap).map((cardId) => {
      return constructCardForDisplay(cardId, rewardsForPlayersMap[cardId].isHolo, rewardsForPlayersMap[cardId].isPremium);
    });
    const cardsRewardsForWinner = Object.keys(rewardsForWinnerMap).map((cardId) => {
      return constructCardForDisplay(cardId, rewardsForWinnerMap[cardId].isHolo, rewardsForWinnerMap[cardId].isPremium);
    });

    // Cards of the day
    const cardsOfTheDay = ['the-fox', 'veneniagora', 'deadly-viper'];

    return res.view(
      'pages/homepage.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        news: await sails.models.news.find({
          limit: 3,
          sort: 'createdAt DESC',
          where: {
            language: 'fr',
          },
        }),
        cycle: {
          current: currentCycle,
          rewards: {
            players: cardsRewardsForPlayers,
            winner: cardsRewardsForWinner,
          }
        },
        cardOfTheDay: {
          cardId: cardsOfTheDay[Math.floor((Date.now() / (1000 * 60 * 60 * 24))) % (cardsOfTheDay.length - 1)],
          isHolo: false,
          isPremium: false,
        },
      }
    );
  },

};

