var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema({
	order: { type: Number, default: 0},
});

module.exports = mongoose.model('Notification', NotificationSchema);
