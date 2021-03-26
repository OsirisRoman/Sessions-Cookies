const Product = require('../models/product');

const { validationResult } = require('express-validator');

const getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editMode: false,
    errorMessage: req.flash('error'),
  });
};

const postAddProduct = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/add-product', {
      path: '/add/add-product',
      pageTitle: 'Add Product',
      editMode: false,
      errorMessage: errors.errors.map(error => error.msg),
    });
  }
  //all values in req.body are strings
  //multipliying the price cast it to number
  req.body.price = Math.round(req.body.price * 100);
  const product = new Product({ ...req.body, user: req.user._id });

  product
    .save()
    .then(() => {
      res.redirect('/admin/product-list');
    })
    .catch(err => console.log(err));
};

const getEditProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then(product => {
      product.price = (product.price / 100).toFixed(2);
      res.render('admin/add-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editMode: true,
        product: product,
        errorMessage: req.flash('error'),
      });
    })
    .catch(err => console.log(err));
};

const postEditProduct = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/add-product', {
      path: '/admin/edit-product',
      pageTitle: 'Edit Product',
      editMode: true,
      product: { ...req.body, _id: req.params.productId },
      errorMessage: errors.errors.map(error => error.msg),
    });
  }
  const updatedProduct = req.body;
  updatedProduct.price = Math.round(updatedProduct.price * 100);
  Product.updateOne(
    { _id: req.params.productId, user: req.user._id },
    updatedProduct
  )
    .then(() => {
      res.redirect('/admin/product-list');
    })
    .catch(err => console.log(err));
};

const postDeleteProduct = (req, res) => {
  const productId = req.body.productId;
  Product.deleteOne({ _id: productId, user: req.user._id })
    .then(() => {
      res.redirect('/admin/product-list');
    })
    .catch(err => console.log(err));
};

const getProductList = (req, res, next) => {
  Product.find({ user: req.user._id })
    //Product.find()
    .then(products => {
      products.forEach(product => {
        product.price = (product.price / 100).toFixed(2);
      });
      res.render('admin/product-list', {
        productList: products,
        pageTitle: 'Admin Products',
        path: '/admin/product-list',
      });
    })
    .catch(err => console.log(err));
};

module.exports = {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  postDeleteProduct,
  getProductList,
};
