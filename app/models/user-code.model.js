const { Schema, model } = require('mongoose');

const UserCodeSchema = Schema({
    userId: {
        type: String,
    },
    code: {
        type: String
    },
    codeStatus: {
        type: String,
        default: 'not used'
    }

});
module.exports = model( 'UserCode', UserCodeSchema );