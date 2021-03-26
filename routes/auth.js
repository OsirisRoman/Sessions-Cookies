const express = require('express');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

const authController = require('../controllers/auth');

const router = express.Router();

const loginEmailValidation = body('email')
  .isEmail()
  .withMessage('Email is not valid')
  .custom((value, { req }) => {
    return User.findOne({ email: value }).then(userDoc => {
      if (!userDoc) {
        return Promise.reject('Invalid email or password');
      }
      return bcrypt
        .compare(req.body.password, userDoc.password)
        .then(doMatch => {
          if (!doMatch) {
            return Promise.reject('Invalid email or password');
          } else {
            req.session.user = userDoc._id;
          }
        });
    });
  });

const usernameValidation = body('name')
  .isLength({ min: 1 })
  .withMessage("User name can't be empty.");

const passwordAndConfirmPasswordValidation = body('password')
  .isLength({ min: 5 })
  .withMessage('Password is too short/insecure')
  .custom((value, { req }) => {
    if (value !== req.body.confirmedPassword) {
      throw new Error('Passwords have to match.');
    }
    return true;
  });

const emailNonExistanceValidation = body('email')
  .isEmail()
  .withMessage('Email is not valid')
  .custom((value, { req }) => {
    return User.findOne({ email: value }).then(userDoc => {
      if (userDoc) {
        return Promise.reject(
          'This email is already in use, please pickup a different one'
        );
      }
    });
  });

const emailExistanceValidation = body('email')
  .isEmail()
  .withMessage('Email is not valid')
  .custom((value, { req }) => {
    return User.findOne({ email: value }).then(userDoc => {
      if (!userDoc) {
        return Promise.reject('The email has not been registered yet');
      } else {
        req.targetUser = userDoc;
      }
    });
  });

const tokenValidation = body('pasword').custom((value, { req }) => {
  return User.findOne({
    resetToken: req.params.token,
    resetTokenExpiration: { $gt: Date.now() },
  }).then(userDoc => {
    if (!userDoc) {
      return Promise.reject(
        'The unique link has expired, please generate a new one.'
      );
    } else {
      req.targetUser = userDoc;
    }
  });
});

router.get('/login', authController.getLogin);

router.post(
  '/login',
  //checks email to be a valid email,
  //checks email existance and
  //checks email-password match
  loginEmailValidation,
  authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post(
  '/signup',
  //checks non empty username
  usernameValidation,
  //checks email to be a valid email,
  //checks email non-existance
  emailNonExistanceValidation,
  //checks password length > 5 and
  //checks password-confirmedPassword equality
  passwordAndConfirmPasswordValidation,
  authController.postSignup
);

router.get('/reset-password', authController.getResetPassword);

router.post(
  '/reset-password',
  //checks email to be a valid email
  emailExistanceValidation,
  authController.postResetPassword
);

router.get(
  '/update-password/:token',
  //checks token existance and expiration.
  tokenValidation,
  authController.getUpdatePassword
);

router.post(
  '/update-password',
  //checks password length > 5 and
  //checks password-confirmedPassword equality
  passwordAndConfirmPasswordValidation,
  authController.postUpdatePassword
);

module.exports = router;
