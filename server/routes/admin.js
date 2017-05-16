var router = require('express').Router();
var Category = require('../models/category');
var Product = require('../models/products');
var Order = require('../models/order');
var Notification = require('../models/notification');

router.get('/admin', function(req,res){
  if(req.user) {
    if(req.user._id == "571b153c2b86167c1c60a792") {
      res.render('admin/admin',{
        categoryMsg: req.flash('categoryMessage'),
        productMsg: req.flash('productMessage')
      });
    }
    else {
      res.redirect('/');
    }
  }
  else {
    res.redirect('/');
  }
});

router.post('/addcategory', function(req,res,next){
  var category = new Category();
  category.name = req.body.name;
  category.image = req.body.image;

  category.save(function(err){
    if (err) {
      req.flash('categoryMessage', 'Already has this Category!');
      return res.send({'success': "SUCCESS"});
    }
    req.flash('categoryMessage', 'Category Added!');
    return res.send({'success': "SUCCESS"});
  });
});

router.post('/addproduct', function(req,res,next) {
  var product = new Product();
  product.category = req.body.category;
  product.name = req.body.name;
  product.type = req.body.type;
  product.description = req.body.description;
  product.price = parseFloat(req.body.price);
  product.quantity = parseFloat(req.body.quantity);
  product.discount = parseFloat(req.body.discount);
  product.image = req.body.image;

  product.save(function(err){
    if (err) {
      req.flash('productMessage', 'Error!');
      return res.send({'success': "SUCCESS"});
    }
    req.flash('productMessage', 'Product Added!');
    return res.send({'success': "SUCCESS"});
  });
});

router.get('/allorder', function(req,res,next){
  Notification.update({_id:"571b3ff9fca0fd03db5aae6f"}, {$set: {order:0}}, function(callback,noti){});
  Order.find({}, function(err, order){
    res.json(order);
  });
});

module.exports = router;
