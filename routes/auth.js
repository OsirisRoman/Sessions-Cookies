const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');

const router = express.Router();

const emailValidation = body('email')
  .isEmail()
  .withMessage('Email is not valid');

const loginValidation = body('email')
  .isEmail()
  .withMessage('Email is not valid')
  .custom((value, { req }) => {
    if (req.body.password.length < 5) {
      throw new Error('Password is too short/insecure.');
    }
    return true;
  });

const updatePasswordValidation = body('password')
  .isLength({ min: 5 })
  .withMessage('Password is too short/insecure')
  .custom((value, { req }) => {
    if (value !== req.body.confirmedPassword) {
      throw new Error('Passwords have to match.');
    }
    return true;
  });

const usernameValidation = body('name')
  .isLength({ min: 1 })
  .withMessage("User name can't be empty.")
  .custom((value, { req }) => {
    if (req.body.password !== req.body.confirmedPassword) {
      throw new Error('Passwords have to match.');
    }
    return true;
  });

router.get('/login', authController.getLogin);

router.post(
  '/login',
  //checks email to be a valid email and
  //password length > 5 characters
  loginValidation,
  authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post(
  '/signup',
  //checks non empty username and password
  //to be equal to confirmed password
  usernameValidation,
  //checks email to be a valid email and
  //password length > 5 characters
  loginValidation,
  authController.postSignup
);

router.get('/reset-password', authController.getResetPassword);

router.post(
  '/reset-password',
  //checks email to be a valid email
  emailValidation,
  authController.postResetPassword
);

router.get('/update-password/:token', authController.getUpdatePassword);

router.post(
  '/update-password',
  updatePasswordValidation,
  authController.postUpdatePassword
);

module.exports = router;
