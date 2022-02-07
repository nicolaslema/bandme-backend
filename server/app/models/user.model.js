const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String
    },
    userType: {
        type: String
    },
    provider: {
        type: String
    },
    profilePhoto: {
        type: String,
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    accountStatus: {
        type: String,
        default: 'diseable'
    }

});

UserSchema.pre('save', function(next){
    const user = this;
    if(!user.isModified('password')) return next();
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10))
    next();
});


module.exports = model( 'User', UserSchema );