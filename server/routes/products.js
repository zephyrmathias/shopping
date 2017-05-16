var router = require('express').Router();
var Category = require('../models/category');
var Product = require('../models/products');
var Cart = require('../models/cart');

router.get('/products', function(req,res){
  res.render('products/products');
});

router.get('/products/:id', function(req,res){
  Category.findById({_id:req.params.id}, function(err,category){
    if(category) {
      res.render('products/product');
    }
    else {
      res.send("CATEGORY IS NOT FOUND.");
    }
  })
})

router.get('/api/products/:id', function(req,res,next){
  Product
    .find({ category: req.params.id })
    .populate('category')
    .exec(function(err, products) {
      if (err) return next(err);
      res.json(products);
    });
})

router.post('/addtocart/', function(req,res,next){
  Cart.findOne({owner:req.user._id}, function(err,cart){
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.totalPrice),
      quantity: parseInt(req.body.quantity)
    });

    cart.total = (cart.total + parseFloat(req.body.totalPrice)).toFixed(2);

    cart.save(function(err){
      if(err) return next(err);
      res.send("ADDED");
    });
  });
});

router.get('/cart', function(req,res,next){
  Cart
    .findOne({owner:req.user._id})
    .populate('items.item')
    .exec(function(err, foundCart){
      if(err) return next(err);
      res.json(foundCart);
    });
});

router.post('/removeCartItem', function(req,res,next){
  Cart.findOne({owner: req.user._id}, function(err,foundCart){
    foundCart.items.pull(String(req.body._id));
    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save(function(err, found){
      if(err) return next(err);
      res.send("DELETED");
    })
  })
});

router.get('/search/:name', function(req,res,next){
 Product.find({name:req.params.name})
 .exec(function(err,found){
  if(err) {
    console.log("ERR");
  };

  if(found.length === 0) {
    res.render('products/search', {
      errorMsg:"NOT FOUND THIS PRODUCT",
      item: ""
    });
  }
  else {
      res.render('products/search', {
        item:found,
        errorMsg: ""
      });
  }
 })
});

router.get('/allproducts', function(req,res,next){
  Product.find({},function(err,products){
    if(err) return next(err);
    res.json(products);
  });
});

router.put('/editproduct', function(req,res,next){
  var query = {_id: req.body._id};
  var update = {
    name: req.body.name,
    image: req.body.image,
    type: req.body.type,
    description: req.body.description,
    quantity: req.body.quantity,
    price: req.body.price,
    discount: req.body.discount,
    category: req.body.category
  };
  Product.findOneAndUpdate(query,update,{},function(err,product){
    if(err) return next(err);
    return res.send({'success': "SUCCESS"});
  });
});

router.delete('/deleteproduct/:id', function(req,res,next){
	Product.remove({_id:req.params.id}, function(err,product){
    if(err) return next(err);
    return res.send({'success': "SUCCESS"});
  });
});

router.put('/editcategory', function(req,res,next){
  var query = {_id: req.body.id};
  var update = {
    name: req.body.name,
    image: req.body.image
  };

  Category.findOneAndUpdate(query,update,{},function(err,product){
    if(err) return next(err);
    return res.send({'success': "SUCCESS"});
  });
});

router.delete('/deletecategory/:id', function(req,res,next){
	Category.remove({_id:req.params.id}, function(err,category){
    if(err) return next(err);
    return res.send({'success': "SUCCESS"});
  });
});

module.exports = router;
