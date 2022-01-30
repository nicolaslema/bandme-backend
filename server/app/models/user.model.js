const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    email: {
        type: String
    },
    password: {
        type: String
    },
    userType: {
        type: String
    }

});

module.exports = model( 'User', UserSchema );