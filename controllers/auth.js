const User = require('../models/user');
const bcrypt = require('bcryptjs');

const getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login Page',
    errorMessage: req.flash('error'),
  });
};

const postLogin = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(userDoc => {
      if (!userDoc) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }
      bcrypt.compare(req.body.password, userDoc.password).then(doMatch => {
        if (!doMatch) {
          req.flash('error', 'Invalid email or password');
          return res.redirect('/login');
        }
        req.session.isLoggedIn = true;
        req.session.user = userDoc._id;
        return req.session.save(err => {
          if (err) {
            console.log(err);
          }
          res.redirect('/');
        });
      });
    })
    .catch(err => {
      console.log(err);
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

const getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup Page',
    errorMessage: req.flash('error'),
  });
};

const postSignup = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(userDoc => {
      if (userDoc) {
        req.flash(
          'error',
          'This email is already in use, please pickup a different one'
        );
        return res.redirect('/signup');
      }
      return bcrypt.hash(req.body.password, 12).then(hashedPassword => {
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
          cart: [],
        });
        return user.save().then(() => res.redirect('/login'));
      });
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
};
