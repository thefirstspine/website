/**
 * PnpController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {
    return res.view(
      'pages/pnp.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        title: 'Print and Play',
      }
    );
  },

  async build(req, res) {
    const fetch = require('node-fetch');

    const destiniesToFetch = [
      'conjurer',
      'summoner',
      'sorcerer',
      'hunter',
    ].filter((d) => {
      return req.query[d] === '1';
    });
    
    const destinies = await Promise.all(destiniesToFetch.map(async (d) => {
      const response = await fetch(`${process.env.REST_URL}/rest/decks/${d}`);
      return response.json();
    }));

    const originsToFetch = [
      'healer',
      'architect',
      'priest',
    ].filter((d) => {
      return req.query[d] === '1';
    });
    const origins = await Promise.all(originsToFetch.map(async (d) => {
      const response = await fetch(`${process.env.REST_URL}/rest/decks/${d}`);
      return response.json();
    }));

    const allowedStyles = [
      'classic',
      'nostalgy',
      'scales',
      'cartographer',
    ];
    const style = allowedStyles.includes(req.query.style) ? req.query.style : 'classic';

    return res.view(
      'pages/pnp-renderer.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        layout: 'layouts/printable',
        title: 'Print and Play',
        style,
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

