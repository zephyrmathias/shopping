var router = require('express').Router();
var User = require('../models/user');
var Cart = require('../models/cart');
var Order = require('../models/order');
var async = require('async');
var passport = require('passport');
var passportConfig = require('../config/passport');
var stripe = require('stripe')('sk_test_fuhL3VaLugoAJfHfSWTjN89Z');
var Notification = require('../models/notification');

router.get('/signup', function(req, res, next) {
  res.render('account/signup', {
    errors: req.flash('errors')
  });
});

router.post('/signup', function(req,res,next){
	async.waterfall([
		function(callback) {
			var user = new User();
			user.email = req.body.email;
			user.password = req.body.password;
			User.findOne({email: req.body.email}, function(err,existingUser){
				if (existingUser) {
					req.flash('errors', 'This Email Already Exists.');
					return res.send({'error': "ERROR"});
				}
				else {
					user.save(function(err,user){
						if(err) return next(err);
						callback(null,user);
					});
				}
			});
		},
		function(user) {
			var cart = new Cart();
			cart.owner = user._id;
			cart.save(function(err){
				if (err) return next(err);
				return res.send({'register': "REGISTERED"});
			})
		}
	]);
});

router.get('/login', function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/login', { message: req.flash('loginMessage')});
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send({'error':"ERROR"});
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      res.status(200).json({
        status: 'Login successful!'
      });
    });
  })(req, res, next);
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

router.get('/profile', function(req,res){
	if (!req.user) return res.redirect('/login');
	User.findOne({ _id: req.user._id }, function(err, user) {
	    if (err) return next(err);
	    res.render('account/profile', { user: user });
	});
});

router.put('/profile', function(req,res){
	var data = req.body;
	User.updateUser(req.user._id, data, {}, function(err,user){
		if(err) {
			res.send(err);
		}
		else {
			res.json(user);
		}
	});
});

router.get('/payment', function(req,res,next){
  res.render('account/payment');
});

router.post('/payment', function(req,res,next){
  console.log(req.body);
  var stripeToken = req.body.stripeToken;
  var currenCharges = Math.round(req.body.stripeMoney * 100);
  stripe.customers.create({
    source: stripeToken
  }).then(function(customer){
    return stripe.charges.create({
      amount: currenCharges,
      currency: 'usd',
      customer: customer.id
    });
  }).then(function(charge){
    async.waterfall([
      function(callback){
        Cart
        .findOne({owner:req.user._id})
        .populate('items.item')
        .exec(function(err,cart){
          if(err) return next(err);
          callback(err,cart);
        })
      },
      function(cart, callback){
        console.log(cart);
        var order = new Order();
        order.owner = req.user._id;
        order.total = cart.total;
        order.items = cart.items;
        order.save(function(err,order){
          if(err) return next(err);
          callback(err,order);
        });
      },
      function(order, callback){
        User.findOne({_id: req.user._id}, function(call,user){
          if(user) {
            user.history.push({
              order: order._id
            });
          }
          user.save(function(err,user){
            if(err) return next(err);
            callback(err,user);
          });
        })
      },
      function(user, callback){
        Notification.update({_id:"571b3ff9fca0fd03db5aae6f"}, {$inc: {order: 1}}, function(callback,noti){});
        Cart.update({owner:user._id}, {$set: {items: [], total:0}}, function(err,updated){
          if (updated) {
            res.send("UPDATED");
          }
        })
      },
    ])
  })
});

router.get('/history/:id', function(req,res,next){
  Order
    .find({ owner: req.params.id })
    .populate('items.item')
    .exec(function(err, orders) {
      if (err) return next(err);
      res.json(orders);
    });
});

router.get('/order/:id', function(req,res,next){
  Order
  .findById({_id:req.params.id})
  .populate('items.item')
  .populate('owner')
  .exec(function(err,order){
    if(err) return next(err);
    res.json(order);
  });
});

module.exports = router;
