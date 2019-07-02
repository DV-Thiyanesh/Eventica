const mongoose = require('mongoose');

// define the User model schema
const SubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        index: { unique: true }
    },
	name: String,
	message: String,
    status: { type:Number, default:1},
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);