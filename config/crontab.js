module.exports.crontab = {

  /*
  * The asterisks in the key are equivalent to the
  * schedule setting in crontab, i.e.
  * minute hour day month day-of-week year
  * so in the example below it will run every minute
  */
  
  crons:function() {
    return [
      {interval: '0 0 * * *', method: 'refer-a-friend-send-emails'},
      {interval: '* * * * *', method: 'tournaments-open'},
      {interval: '* * * * *', method: 'tournaments-watch-match'},
    ];
  },
  
  // declare the method mytest
  // and add it in the crons function
  'refer-a-friend-send-emails': function() {
    require('../crontab/refer-a-friend-send-emails.js').run();
  },
  'tournaments-open': function() {
    require('../crontab/tournaments-open.js').run();
  },
  'tournaments-watch-match': function() {
    require('../crontab/tournaments-watch-match.js').run();
  },
};