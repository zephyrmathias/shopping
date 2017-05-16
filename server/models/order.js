var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderSchema = new Schema({
	owner: { type: Schema.Types.ObjectId, ref: 'User' },
	total: { type: Number, default: 0 },
	items: [{
		item: { type: Schema.Types.ObjectId, ref: 'Product' },
		quantity: { type: Number, default: 1 },
		price: { type: Number, default: 0 },
	}],
	date: {
		type: Date,
		default: Date.now
	},
});

module.exports = mongoose.model('Order', OrderSchema);
