let products      = require('express').Router();
let productCtrl   = require('../controllers').Product;
let helper        = require('../helpers').Auth;

// routes ====================================================

// /products
products.route('/')
        .get(productCtrl.getAll)
        .post(helper.authorize(['Coach', 'Manager','Admin']), productCtrl.newProduct);

// /products/:id
products.route('/:id')
        .get(productCtrl.getProduct)
        .put(helper.authorize(['Coach', 'Manager','Admin']), productCtrl.updateProduct)
        .delete(helper.authorize(['Coach', 'Manager','Admin']), productCtrl.deleteProduct);

module.exports = products;
