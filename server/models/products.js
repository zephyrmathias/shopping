var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = Schema({
	category: {
		type: Schema.Types.ObjectId,
		ref: 'Category'
	},
	name: {
		type: String,
		default: ""
	},
	type: {
		type: String,
		default: ""
	},
	description: {
		type: String,
		default: ""
	},
	discount: {
		type: Number,
		default: 0
	},
	quantity: {
		type: Number,
		default: 0
	},
	price: {
		type: Number,
		default: 0
	},
	date: {
		type: Date,
		default: Date.now
	},
	image: {
		type: String,
		default: ''
	}
});

var Product = module.exports = mongoose.model('Product', ProductSchema);
