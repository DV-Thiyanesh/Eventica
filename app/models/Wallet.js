const mongoose = require('mongoose');

// define the User model schema
const OrderSchema = new mongoose.Schema({
    coin : String,
    publickey: String,
    privatekey: String,
    balance: String,
    used: String,
    userid: String,
    firstname: String,
    lastname: String,
    email: String,
    amount: String,
    orderid: String,
});

module.exports = mongoose.model('Wallet1', OrderSchema);