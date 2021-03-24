const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login Page',
    errorMessage: req.flash('error'),
  });
};

const postLogin = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login Page',
      errorMessage: errors.errors.map(error => error.msg),
    });
  }
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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup Page',
      errorMessage: errors.errors.map(error => error.msg),
    });
  }
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

const getResetPassword = (req, res, next) => {
  res.render('auth/resetPassword', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: req.flash('error'),
  });
};

const postResetPassword = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/resetPassword', {
      path: '/resetPassword',
      pageTitle: 'Reset Password',
      errorMessage: errors.errors.map(error => error.msg),
    });
  }
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      req.flash('error', 'An error occurred during the process, please retry');
      return res.redirect('/reset-password');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(userDoc => {
        if (!userDoc) {
          req.flash('error', 'Invalid email');
          return res.redirect('/reset-password');
        }
        userDoc.resetToken = token;
        userDoc.resetTokenExpiration = Date.now() + 30000;
        userDoc.save();
        //The following link must be sent to userDoc.email using any SMTP service.
        console.log(`http://localhost:3000/update-password/${token}`);
        res.redirect('/login');
      })
      .catch(err => {
        console.log(err);
      });
  });
};

const getUpdatePassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  }).then(userDoc => {
    //console.log(userDoc);
    if (!userDoc) {
      req.flash(
        'error',
        'The unique link has expired, please generate a new one.'
      );
      return res.redirect('/reset-password');
    }
    res.render('auth/updatePassword', {
      path: '/updatePassword',
      pageTitle: 'Update Password',
      errorMessage: req.flash('error'),
      userId: userDoc._id.toString(),
    });
  });
};

const postUpdatePassword = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/reset-password', {
      path: '/reset-password',
      pageTitle: 'Reset Password',
      errorMessage: errors.errors.map(error => error.msg),
    });
  }
  let user;
  User.findById(req.body.userId)
    .then(userDoc => {
      user = userDoc;
      return bcrypt.hash(req.body.newPassword, 12);
    })
    .then(hashedPassword => {
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      user.save();
      res.redirect('/login');
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
  getResetPassword,
  postResetPassword,
  getUpdatePassword,
  postUpdatePassword,
};
