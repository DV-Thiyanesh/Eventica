const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PresaleSchema = new Schema({
		address: {
			type: String,
			required: true,
		},
		firstName: String,
		lastName: String,
		email: String,
		date: { type: Date, default: Date.now },
		btc: String,
		eth: String,
		bonus: Number,
		tokens: Number,
		status: String,
		transactionDate: { type: Date, default: Date.now },
		transactionNumber:String,
	},
	{ collection : 'presale', strict: true });

module.exports = mongoose.model('presale', PresaleSchema);
