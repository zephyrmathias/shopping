var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = Schema({
	email: {
		type: String,
		require: true,
		unique: true,
		lowercase: true
	},
	password: {
		type: String,
		require: true
	},
	name: {
		type: String,
		default: '',
	},
	address: {
		address: { type: String, default: ''},
		city: { type: String, default: ''},
		state: { type: String, default: ''},
		zipcode: { type: String, default: ''}
	},
	phone: {
		type: String
	},
	creditcard: {
		cardNumber: { type: Number, default: 0},
		cvCode: { type:Number, default: 0}
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	history: [{
		order: { type: Schema.Types.ObjectId, ref: 'Order' }, 
	}]
});

UserSchema.pre('save', function(next){
	var user = this;
	if (!user.isModified('password')) return next();
	bcrypt.genSalt(10,function(err,salt){
		if(err) return next(err);
		bcrypt.hash(user.password, salt, null, function(err,hash){
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});

UserSchema.methods.comparePassword = function(password) {
	return bcrypt.compareSync(password, this.password);
}

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.updateUser = function(id, user, options, callback) {
	var query = {_id: id};
	var update = {
		name: user.name,
		phone: user.phone,
		address: {
			address: user.address.address,
			city: user.address.city,
			state: user.address.state,
			zipcode: user.address.zipcode
		},
		creditcard: {
			cardNumber: user.creditcard.cardNumber,
			cvCode: user.creditcard.cvCode
		}
	}
	User.findOneAndUpdate(query,update,options,callback);
}
