const { readCookie } = require('../utils/getCookie');

exports.get404 = (req, res, next) => {
  res.status(404).render('404NotFound', {
    pageTitle: '404 Not Found',
    path: '',
    isAuthenticated: req.session.isLoggedIn,
  });
};