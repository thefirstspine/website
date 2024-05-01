/**
 * PnpController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { default: axios } = require('axios');

module.exports = {

  async index(req, res) {
    return res.view(
      'pages/pnp.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        title: 'pnp.title',
      }
    );
  },

  async build(req, res) {
    const destiniesToFetch = [
      'conjurer',
      'summoner',
      'sorcerer',
      'hunter',
    ].filter((d) => {
      return req.query[d] === '1';
    });
    
    const destinies = await Promise.all(destiniesToFetch.map(async (d) => {
      const response = await axios.get(`${process.env.GAME_ASSETS_URL}/rest/decks/${d}`);
      return response.data;
    }));

    const originsToFetch = [
      'healer',
      'architect',
      'priest',
    ].filter((d) => {
      return req.query[d] === '1';
    });
    const origins = await Promise.all(originsToFetch.map(async (d) => {
      const response = await axios.get(`${process.env.GAME_ASSETS_URL}/rest/decks/${d}`);
      return response.data;
    }));

    return res.view(
      'pages/pnp-renderer.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        layout: 'layouts/printable',
        title: 'Print and Play',
        style: 'classic',
        destinies,
        origins,
        colors: {
          'conjurer': 'DODGERBLUE',
          'summoner': 'CRIMSON',
          'sorcerer': 'GOLD',
          'hunter': 'SLATEGRAY',
        },
      }
    );
  }

};

