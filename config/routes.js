/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/


  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/

  // Pages
  'GET /': 'HomepageController.index',
  'GET /cgu': 'CGUController.index',

  // Arena
  'GET /arena': 'ArenaController.index',
  'GET /download/windows': 'DownloadController.windows',

  // Blog
  'GET /blog': 'BlogController.listArticles',
  'GET /blog/:slug': 'BlogController.viewArticle',
  
  // User & auth
  'GET /login': 'UserController.viewLoginForm',
  'POST /login': 'UserController.tryLogin',
  'GET /profile': 'UserController.viewProfile',
  'POST /profile': 'UserController.editProfile',
  'GET /subscribe': 'UserController.viewSubscriptionForm',
  'POST /subscribe': 'UserController.submitSubscription',

  // Codes
  'POST /codes': 'CodesController.submit',
  'GET /codes': 'CodesController.viewForm',


};
