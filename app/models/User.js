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
    email: String,
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
        default: 'New'
    },
    created: {
        type: Date,
        default: Date.now
    },
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

UserSchema.methods.comparePassword = function comparePassword(password, callback) {
    bcrypt.compare(password, this.password, callback);
};








// UserSchema.pre('save', function (next) {
//     const user = this;

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

//     if (!user.isModified('password')) return next();
//     if (user.isModified('password')) {
//         return bcrypt.genSalt((saltError, salt) => {
//             if (saltError) {
//                 return next(saltError);
//             };
//             return bcrypt.hash(user.password, salt, (hashError, hash) => {
//                 if (hashError) { return next(hashError) }
//                 user.password = hash;
//                 return next();
//             })
//         })
//     }
// });
