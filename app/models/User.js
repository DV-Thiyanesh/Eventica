const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    firstname: String,
    lastname: String,
    gender: String,
    dob: {
        type: Date
    },
    email: {
        type: String,
        index: { unique: true }
    },
    password: String,
    mobileNo: String,
    nationality: String,
    country: String,
    residence: String,
    address: String,
    employmentStatus: String,
    jobTitle: String,
    currentEmployer: String,
    industry: String,
    annualIncome: String,
    otherIncome: String,
    religion: String,
    netAsset: String,
    declaration: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        default: 'Active'
    },
    created: {
        type: Date,
        default: Date.now
    },
    // walletAddress: {
    //     type: String,
    //     unique: true
    // },
    seed: String,
    restToken: String,
    accountType: {
        type: String,
        default: 'User'
    },
    permenantAddress: {
        type: Object
    },
    presentAddress: {
        type: Object
    },
    uid: {
        type: String
    },
    proimg: String
});


module.exports = mongoose.model('User', UserSchema);

UserSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return next();
    if (user.isModified('password')) {
        return bcrypt.genSalt((saltError, salt) => {
            if (saltError) {
                return next(saltError);
            };
            return bcrypt.hash(user.password, salt, (hashError, hash) => {
                if (hashError) { return next(hashError) }
                user.password = hash;
                return next();
            })
        })
    }
});