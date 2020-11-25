/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  '*': ['load-user', 'set-locale'],

  UserController: {
    '*': ['load-user', 'set-locale', 'is-logged-in'],
    'tryLoginWithFacebook': ['load-user', 'set-locale'],
    'viewForgottenPasswordForm': ['load-user', 'set-locale'],
    'sendNewPassword': ['load-user', 'set-locale'],
    'viewLoginForm': ['load-user', 'set-locale'],
    'tryLogin': ['load-user', 'set-locale'],
    'viewSubscriptionForm': ['load-user', 'set-locale'],
    'submitSubscription': ['load-user', 'set-locale'],
  },

  ReportController: {
    '*': ['load-user', 'set-locale', 'is-logged-in'],
  },

  // Blueprint API
  'news/*':['load-user', 'is-logged-in', 'is-admin'],
  'news/find':[],
  'news/findOne':[],
  'event/*':['load-user', 'is-logged-in', 'is-admin'],
  'event/find':[],
  'event/findOne':[],
  'code/*':['load-user', 'is-logged-in', 'is-admin'],
  'refer/*':['load-user', 'is-logged-in', 'is-admin'],

};
