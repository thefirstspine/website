/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * https://sailsjs.com/docs/concepts/logging
 */

const { LogsService } = require('@thefirstspine/logs/lib/logs.service');
const logsService = new LogsService({
  console: true,
  loggly: (process.env.LOGS_LOGGLY_SUBDOMAIN != undefined && process.env.LOGS_LOGGLY_TOKEN != undefined),
  datadog: (process.env.LOGS_DD_API_KEY != undefined),
});

const logger = {
  warn: (...params) => {
    console.log('Log "warn" from website', { params });
    logsService.warning('Log "warn" from website', { params });
  },
  error: (...params) => {
    console.log('Log "error" from website', { params });
    logsService.error('Log "error" from website', { params });
  },
  debug: (...params) => {
    console.log('Log "debug" from website', { params });
    logsService.info('Log "debug" from website', { params });
  },
  info: (...params) => {
    console.log('Log "info" from website', { params });
    logsService.info('Log "info" from website', { params });
  },
  log: (...params) => {
    console.log('Log "log" from website', { params });
    logsService.info('Log "log" from website', { params });
  },
}

module.exports.log = {

  /***************************************************************************
  *                                                                          *
  * Valid `level` configs: i.e. the minimum log level to capture with        *
  * sails.log.*()                                                            *
  *                                                                          *
  * The order of precedence for log levels from lowest to highest is:        *
  * silly, verbose, info, debug, warn, error                                 *
  *                                                                          *
  * You may also set the level to "silent" to suppress all logs.             *
  *                                                                          *
  ***************************************************************************/

  // level: 'info'
  custom: logger,

};
