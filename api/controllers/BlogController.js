/**
 * BlogController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
  async listArticles(req, res) {
    return res.view(
      'pages/blog.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        news: await sails.models.news.find({
          sort: 'createdAt DESC',
          where: {
            language: 'fr',
          },
        }),
      }
    );
  },

  async viewArticle(req, res) {
    const article = await sails.models.news.findOne({slug: req.param('slug')});

    if (!article) {
      return res.notFound();
    }

    return res.view(
      'pages/article.ejs',
      {
        ...await sails.helpers.layoutConfig(req.user_id),
        article,
      }
    );
  }

};

