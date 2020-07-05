/**
 * RulesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async index(req, res) {
    const id = parseInt(req.param('id'));
    if (id === 0 || isNaN(id)) {
      return res.notFound();
    }

    return res.view(
      'pages/report.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        errors: [],
      }
    );
  },

  async report(req, res) {
    const id = parseInt(req.param('id'));
    if (id === 0 || isNaN(id)) {
      return res.notFound();
    }

    const reason = req.body.reason;
    const details = req.body.details;

    const errors = [];
    if (!['cheat', 'inappropriate-behavior-insults', 'harassment-or-intimidation'].includes(reason)) {
      errors.push('report.errorInvalidReason');
    }
    if (typeof(details) !== "string" || details.length < 10) {
      errors.push('report.errorMoreDetails');
    }

    if (errors.length) {
      return res.view(
        'pages/report.ejs',
        {
          ...await sails.helpers.layoutConfig(req.user_id),
          errors,
          reason,
          details,
        }
      );
    }

    const nodemailer = require('nodemailer');
    const smtpTransport = require('nodemailer-smtp-transport');
    const transport = nodemailer.createTransport(smtpTransport(process.env.SMTP_TRANSPORT));
    var mailOptions = {
      from: 'TFS report abuse form <teddy@thefirstspine.fr>', // sender address
      to: process.env.REPORT_TO, // list of receivers
      subject: 'Someone submitted an abuse ticket', // Subject line
      text: `Player ID of sumbmitter: "${req.user_id}"
Targetted player ID: "${id}"

Reason: ${reason}

Details: ${details}
`, // plaintext body
    };

    transport.sendMail(mailOptions, function(error, info){
      if(error) {
        console.log(error);
      } else {
        console.log('Message sent: ' , info);
      }
    });

    return res.view(
      'pages/report.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        message: 'report.messageReportSent',
      }
    );
  },

};
