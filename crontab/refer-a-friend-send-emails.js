module.exports = {
  run: async function () {
    // Load modules
    const fetch = require('node-fetch');
    const fs = require('fs');
    const nodemailer = require('nodemailer');
    const smtpTransport = require('nodemailer-smtp-transport');
    const transport = nodemailer.createTransport(smtpTransport(process.env.SMTP_TRANSPORT));

    // Getting all the referrals
    const referCodes = await sails.models.refer.find({
      user: { '!=' : null }
    });

    // Main routine
    await Promise.all(referCodes.map(async (referCode) => {
      sails.log(`Look for refer ${referCode.code} (referer: ${referCode.referer}, referral: ${referCode.user})`);

      // Load wizard account
      const wizardResponse = await fetch(`${process.env.ARENA_REALMS_URL.replace('{realm}', 'sanctuaire')}/wizard/${referCode.user}`);
      const wizard = await wizardResponse.json();
      sails.log(`Wizard "${wizard.name}" (#${wizard.id}) loaded.`);

      // Had play first game?
      if (!referCode.hadFirstPlayGift) {
        // Look for first game in history
        const game = wizard.history.find((historyItem) => historyItem.gameTypeId !== 'fpe');
        if (game) {
          sails.log(`Wizard "${wizard.name}" had play its first game. Generate loots.`);

          // He had play its first game! Generate rewards
          const codeToReferer = await sails.models.code.create({
            code: `${(Math.floor(Math.random() * 8999) + 1000)}${(Math.floor(Math.random() * 8999) + 1000)}${(Math.floor(Math.random() * 8999) + 1000)}`,
            loots: {
              shard: 100,
            }
          }).fetch();
          sails.log(`Code for referer created:`, codeToReferer.code);
          const codeToReferal = await sails.models.code.create({
            code: `${(Math.floor(Math.random() * 8999) + 1000)}${(Math.floor(Math.random() * 8999) + 1000)}${(Math.floor(Math.random() * 8999) + 1000)}`,
            loots: {
              shard: 100,
            }
          }).fetch();
          sails.log(`Code for referer created:`, codeToReferal.code);

          // Load user informations
          const refererUserRequest = await fetch(
            `${process.env.AUTH_URL}/api/v2/users/${referCode.referer}`,
            {
              headers: {
                'X-Client-Cert': Buffer.from(process.env.AUTH_PUBLIC_KEY.replace(/\\n/gm, '\n')).toString('base64'),
                'X-Client-Cert-Encoding': 'base64',
              }
            }
          );
          const refererUser = await refererUserRequest.json();
          sails.log(`Referer loaded:`, refererUser);
          const referalUserRequest = await fetch(
            `${process.env.AUTH_URL}/api/v2/users/${referCode.user}`,
            {
              headers: {
                'X-Client-Cert': Buffer.from(process.env.AUTH_PUBLIC_KEY.replace(/\\n/gm, '\n')).toString('base64'),
                'X-Client-Cert-Encoding': 'base64',
              }
            }
          );
          const referalUser = await referalUserRequest.json();
          sails.log(`Referal loaded:`, referalUser);

          // Send the emails
          sails.log(`Send email to referer`);
          const templateToReferer = fs.readFileSync('./assets/html/refer-first-game-referer.html').toString().replace('{{code}}', codeToReferer.code);
          await new Promise((resolve, reject) => {
            transport.sendMail({
              from: 'noreply@thefirstspine.fr', // sender address
              to: refererUser.email, // list of receivers
              subject: '🎁 Votre filleul a terminé sa première partie !', // Subject line
              html:  templateToReferer, // plaintext body
            }, function(error, info){
              if(error) {
                sails.log(error);
                reject(error);
              } else {
                sails.log('Message sent: ' , info);
                resolve();
              }
            });
          });
          sails.log(`Send email to referral`);
          const templateToReferal = fs.readFileSync('./assets/html/refer-first-game-referal.html').toString().replace('{{code}}', codeToReferal.code);
          await new Promise((resolve, reject) => {
            transport.sendMail({
              from: 'noreply@thefirstspine.fr', // sender address
              to: referalUser.email, // list of receivers
              subject: '🎁 Vous avez terminé votre première partie !', // Subject line
              html:  templateToReferal, // plaintext body
            }, function(error, info){
              if(error) {
                sails.log(error);
                reject(error);
              } else {
                sails.log('Message sent: ' , info);
                resolve();
              }
            });
          });

          // Mark as send
          sails.log(`Register as sent.`);
          await sails.models.refer.update({id: referCode.id}).set({
            hadFirstPlayGift: true,
          });
        }
      }
    }));

    // Done
    sails.log(`End.`);
  }

};
