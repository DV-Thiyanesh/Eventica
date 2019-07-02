const mongoose = require('mongoose');

// define the User model schema
const BountySchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    program: String,
    submittedon: String,
    proof: String,
    tokens: String,
    txnnumber: String,
    status: String
});

module.exports = mongoose.model('Bounty', BountySchema);