/**
 * HomepageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {
    if (req.user_id !== 1 && Date.now() < (new Date("Fri Mar 27 2020 17:00:00 GMT+0100")).getTime()) {
      return res.view(
        'pages/wait.ejs',
        {
          card: 'the-return',
        }
      );
    }

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
    const cardsOfTheDay = [
      'the-tower',
      'deadly-viper',
      'summoner',
      'hunter',
      'thunder',
      'putrefaction',
      'ruin',
      'heal',
      'reconstruct',
      'replacement',
      'smoky-totem',
      'barbers',
      'gargoyle',
      'banshee',
      'the-fox',
      'veneniagora',
      'soul-of-a-sacrified-hunter',
      'ether',
      'conjurer',
      'sorcerer',
      'the-wall',
      'shadows-banner',
      'insanes-run',
      'growing-oak',
      'monstrous-portal',
      'jester',
      'paladin-of-the-ninth-desert',
      'volkha',
      'insanes-echo',
      'alter-the-fate',
      'fire',
      'achieve',
      /*
      These cards are digital-only.
      TODO: Think about to add them
      'curse-of-mara',
      'eternity-gift',
      'hunter-souvenir',
      'conjurer-souvenir',
      'summoner-souvenir',
      'sorcerer-souvenir',
      'snow-man-s-present',
      'great-old-egg',
      'juvenile-great-old',
      'great-old',
      'ovil',
      'applicant',
      */
    ];

    return res.view(
      'pages/homepage.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id, req.session.locale),
        news: await sails.models.news.find({
          limit: 3,
          sort: 'createdAt DESC',
          where: {
            language: req.session.locale,
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

