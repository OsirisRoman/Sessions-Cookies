const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product', isAuth, adminController.postAddProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post(
  '/edit-product/:productId',
  isAuth,
  adminController.postEditProduct
);
router.get('/product-list', isAuth, adminController.getProductList);

module.exports = router;
