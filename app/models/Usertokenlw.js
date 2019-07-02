const mongoose = require('mongoose');


// define the User model schema
const UsertokenlwSchema = new mongoose.Schema({

    userid: String,
    token: String,
    created: String

});


module.exports = mongoose.model('Usertokenlw', UsertokenlwSchema);