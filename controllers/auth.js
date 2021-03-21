const getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login Page',
    isAuthenticated: req.session.isLoggedIn,
  });
};

const postLogin = (req, res, next) => {
  req.session.isLoggedIn = true;
  const userId = '604f832dbcd9ee1ef0ed33ce';
  req.session.user = userId;
  req.session.save(err => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
};

const postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
};
