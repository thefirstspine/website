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

    // Get the current cycle
    const currentCycle =  await sails.helpers.getCycle('current');

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
      'banshee',
      'the-fox',
      'veneniagora',
      'soul-of-a-sacrified-hunter',
      'ether',
      'conjurer',
      'sorcerer',
      'shadows-banner',
      'insanes-run',
      'monstrous-portal',
      'volkha',
      'insanes-echo',
      'fire',
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

