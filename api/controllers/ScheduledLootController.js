/**
 * ScheduledLootController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fetch = require('node-fetch');

module.exports = {

  async index(req, res) {
    // Getting the loot of the day
    const scheduledLoot = await sails.models.scheduledloot.findOne({
      datetimeFrom: { '<': Date.now() },
      datetimeTo: { '>': Date.now() },
    });
    if (!scheduledLoot) {
      return res.notFound();
    }

    // Getting the user-loot relation
    const userScheduledLoot = await sails.models.userscheduledloot.findOne({
      scheduledLootId: scheduledLoot.id,
      user: req.user_id,
    });
    if (userScheduledLoot) {
      // User was already rewarded
      return res.json(
        {
          rewarded: false,
          scheduledLoot,
        }
      );
    }

    // Reward the user
    const promises = Object.keys(scheduledLoot.loots).map((lootName) => {
      return fetch(
        `${process.env.ARENA_URL}/wizard/${req.user_id}/reward`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: lootName,
            num: scheduledLoot.loots[lootName],
          }),
          headers: {
            'X-Client-Cert': Buffer.from(process.env.ARENA_PUBLIC_KEY.replace(/\\n/gm, '\n')).toString('base64'),
            'Content-type': 'application/json',
          },
        });
    });
    await Promise.all(promises);

    // Create user-loot relation
    await sails.models.userscheduledloot.create({
      scheduledLootId: scheduledLoot.id,
      user: req.user_id,
    });

    // Send response
    return res.json(
      {
        rewarded: true,
        scheduledLoot,
      }
    );
  }

};

