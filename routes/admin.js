const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const nameDescriptionValidation = body('name')
  .isLength({ min: 1 })
  .withMessage('The product requires a name')
  .custom((value, { req }) => {
    if (req.body.description < 5) {
      throw new Error('The product requires a description.');
    }
    return true;
  });

const imagePriceValidation = body('imageUrl')
  .isLength({ min: 1 })
  .withMessage('The product requires an image')
  .custom((value, { req }) => {
    //The following regex checks for integer or real numbers
    //The string will begin and end by a number
    //The string is allowed to have just one decimal point
    if (!/^\d+(\.?\d+)$/.test(req.body.price)) {
      throw new Error('The product price is invalid.');
    }
    return true;
  });

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post(
  '/add-product',
  isAuth,
  nameDescriptionValidation,
  imagePriceValidation,
  adminController.postAddProduct
);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post(
  '/edit-product/:productId',
  isAuth,
  nameDescriptionValidation,
  imagePriceValidation,
  adminController.postEditProduct
);
router.get('/product-list', isAuth, adminController.getProductList);

module.exports = router;
