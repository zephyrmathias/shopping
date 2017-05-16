var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
	name: { type: String, unique: true },
	image: { type: String, default: ""},
});

module.exports = mongoose.model('Category', CategorySchema);
