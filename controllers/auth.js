const { readCookie } = require('../utils/getCookie');

const getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login Page',
    isAuthenticated: readCookie(req.get('Cookie'), 'isLoggedIn'),
  });
};

const postLogin = (req, res, next) => {
  //With HttpOnly directive we avoid our cookie to be accessed
  //From the client side console avoiding scripting hacking
  //If you run in the console document.cookie, with this
  //flag the cookie will not appear in the result.
  res.setHeader('Set-Cookie', 'isLoggedIn=true; HttpOnly');
  res.redirect('/');
};

module.exports = {
  getLogin,
  postLogin,
};
