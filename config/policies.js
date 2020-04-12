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

  '*': ['load-user'],

  UserController: {
    '*': ['load-user', 'is-logged-in'],
    'tryLoginWithFacebook': ['load-user'],
    'viewForgottenPasswordForm': ['load-user'],
    'sendNewPassword': ['load-user'],
    'viewLoginForm': ['load-user'],
    'tryLogin': ['load-user'],
    'viewSubscriptionForm': ['load-user'],
    'submitSubscription': ['load-user'],
  },

  // Blueprint API
  'news/*':['load-user', 'is-logged-in', 'is-admin'],
  'news/find':[],
  'news/findOne':[],
  'code/*':['load-user', 'is-logged-in', 'is-admin'],

};
