const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    email: {
        type: String
    },
    password: {
        type: String
    }

});

module.exports = model( 'User', UserSchema );