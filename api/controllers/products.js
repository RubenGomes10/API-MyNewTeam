//================================================================================//
//                               Product Controller                               //
//================================================================================//

var Product = require('../models').Product;

module.exports = { getAll, newProduct, getProduct, updateProduct, deleteProduct };
//
// Get all products
//
function getAll(req,res) {
  process.nextTick(() =>{
    let query = Product.find({});
    query.exec((err,products) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, products: products });
    });
  });
};

//
// Creates a new product
//
function newProduct(req,res) {
  process.nextTick(() => {
    let newProduct = new Product(req.body);
    newProduct.save((err,product) => {
      if(err) return res.status(400).json({ status: 400, message: "Missing some required fields.", error: err});
      res.json({ status: 200, message: 'Product successfully created!', product});
    });
  });
};

//
// Get a product by id
//
function getProduct(req,res) {
  process.nextTick( () => {
    Product.findById(req.params.id, (err,product) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({status: 200, product: product});
    });
  });
};

//
// Update product
//
function updateProduct(req,res) {
  process.nextTick( () => {
    Product.findById(req.params.id, (err,product) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      Object.assign(product, req.body).save((err,product) => {
        if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
        res.json({ status: 200, message: 'Product successfully updated!', product});
      });
    });
  });
};

//
// Delete a Product
//
function deleteProduct(req,res) {
  process.nextTick( () => {
    Product.remove({_id: req.params.id}, (err,result) =>{
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, message:'Product successfully deleted!', result});
    });
  });
};
