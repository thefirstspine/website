module.exports = async (req, res, proceed) => {
  const getLocalFromPrefs = (accept) => {
    if (!accept) {
      return 'en'; // default on non preferences
    }
    const matches = accept.match(/[a-z]{2,8}/gm);
    const allowed = ['fr', 'en'];
    if (matches[0] && allowed.includes(matches[0])) {
      return matches[0];
    }
    return 'en'; // cannot find prefs here
  };

  const locale = req.session.locale ? req.session.locale : getLocalFromPrefs(req.headers['accept-language']);
  req.session.locale = locale;
  req.setLocale(locale);
  return proceed();
};
