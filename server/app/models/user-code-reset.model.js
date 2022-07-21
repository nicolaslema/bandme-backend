const { Schema, model } = require('mongoose');

const UserCodeResetSchema = Schema({
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
module.exports = model( 'UserCodeReset', UserCodeResetSchema );