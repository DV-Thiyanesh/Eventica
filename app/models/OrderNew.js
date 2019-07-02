const mongoose = require('mongoose');


// define the User model schema
const OrderSchema = new mongoose.Schema({

    orderdate: String,
    updated: String,
    userid: String,
    firstname: String,
    lastname: String,
    email: String,
    amount: String,
    conversion: String,
    amountinusd: String,
    currency: String,
    paymenttype: String,
    paymentstatus: String,
    paymentstatus1: String,
    paymentreference: String,
    ether:Number,
    coinname:String,
    coinamount: Number,
    paymentaddress: String,
    ethaddress: String,
    txnnumber: String,
    tokens: String,
    tokenstransferred: String,    
    paymentwallet:String,
    paymentdate: String,
    paymentmessage: String,
    paymentstatusurl: String
    //price: String,
    //{ type: Date, default: Date.now },

});


module.exports = mongoose.model('OrderNew', OrderSchema);