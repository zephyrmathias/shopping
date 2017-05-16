var Cart = require('../server/models/cart');

module.exports = function(req,res,next) {

	if(req.user) {
		Cart.findOne({ owner: req.user._id }, function(err,cart){
			if(cart) {
				res.locals.cart = cart.items.length;
			}
			else {
				res.locals.cart = 0;
			}
			next();
		})
	}

	else {
		res.locals.cart = 0;
		next();
	}
}
