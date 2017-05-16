var router = require('express').Router();
var async = require('async');
var faker = require('faker');
var Category = require('../server/models/category');
var Product = require('../server/models/products');


router.get('/:name', function(req, res, next) {
    async.waterfall([
      function(callback) {
        Category.findOne({ name: req.params.name }, function(err, category) {
          if (err) return next(err);
          callback(null, category);
        });
      },

      function(category, callback) {
        for (var i = 0; i < 1; i++) {
          var product = new Product();
          product.category = category._id;
          product.name = faker.commerce.productName();
          product.price = faker.commerce.price();
          product.image = faker.image.image();

          product.save();
        }
      }
    ]);
    res.json({ message: 'Success' });
});



module.exports = router;
