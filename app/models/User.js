const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// define the User model schema
const UserSchema = new mongoose.Schema({

    email: {
        type: String,
        index: { unique: true }
    },
    password: String,
    firstname: String,
    lastname: String,
    referralcode: String,
    referralby: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    country: String,
    zip: String,
    phone: String,
    status: String,
    docnumber1: String,
    docnumber2: String,
    file1: String,
    file2: String,
    file3: String,
    doc_type1:String,
    doc_type2:String,
    currency: String,
    ethaddress: String,
    ethpaymentwallet: String,
    btcpaymentwallet: String,
    ethbalance: String,
    btcbalance: String,
    headline:String,
    profile_image:String,
    is_login_qr:{ type:Number, default:0 },
    is_verify_phone:{ type:Number, default:0 },
    is_verify_email:{ type:Number, default:0 },
    is_both_identity:{ type:Number, default:0 },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    referralbyemail:String,
    KYCUploaded:{ type:String, default:"No"},
    created_at:{ type: Date, required: true,default: Date.now },
    updated_at:{ type: Date}

});


/**
 * Compare the passed password with the value in the database. A model method.
 *
 * @param {string} password
 * @returns {object} callback
 */
UserSchema.methods.comparePassword = function comparePassword(password, callback) {
    bcrypt.compare(password, this.password, callback);
};


/**
 * The pre-save hook method.
 */
UserSchema.pre('save', function saveHook(next) {
    const user = this;

    // proceed further only if the password is modified or the user is new
    if (!user.isModified('password')) return next();


    return bcrypt.genSalt((saltError, salt) => {
        if (saltError) { return next(saltError); }

        return bcrypt.hash(user.password, salt, (hashError, hash) => {
            if (hashError) { return next(hashError); }

            // replace a password string with hash value
            user.password = hash;

            return next();
        });
    });
});


module.exports = mongoose.model('User', UserSchema);