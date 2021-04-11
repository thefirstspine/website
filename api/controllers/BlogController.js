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
        tags: [
          {
            type: 'property',
            name: 'og:url',
            value: req.baseUrl + req.url,
          },
          {
            type: 'property',
            name: 'og:type',
            value: 'website',
          },
          {
            type: 'property',
            name: 'og:title',
            value: 'The First Spine - ' + req.i18n.__('navigation.news'),
          },
          {
            type: 'property',
            name: 'og:description',
            value: req.i18n.__("navigation.news"),
          },
          {
            type: 'property',
            name: 'og:image',
            value: req.baseUrl + '/images/the-fox.png',
          },
        ],
        title: "news.title",
        news: await sails.models.news.find({
          sort: 'createdAt DESC',
          where: {
            language: req.session.locale,
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
        tags: [
          {
            type: 'property',
            name: 'og:url',
            value: req.baseUrl + req.url,
          },
          {
            type: 'property',
            name: 'og:type',
            value: 'article',
          },
          {
            type: 'property',
            name: 'og:title',
            value: 'The First Spine - ' + article.title,
          },
          {
            type: 'property',
            name: 'og:description',
            value: (article.text.replace(/(<([^>]+)>)/ig,' ').slice(0, 120).split(' ').slice(0, -1).join(' ')) + '...',
          },
          {
            type: 'property',
            name: 'og:image',
            value: req.baseUrl + '/images/' + article.image,
          },
        ],
        title: article.title,
        article,
      }
    );
  }

};

