const fetch = require('node-fetch');

module.exports = async function (req, res, proceed) {
  console.log(req.session.locale);
  const locale = req.session.locale ? req.session.locale : 'fr';
  req.session.locale = locale;
  req.setLocale(locale);
  return proceed();
};
