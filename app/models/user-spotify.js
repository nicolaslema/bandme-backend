const { Schema, model } = require('mongoose');

const UserSpotifyCodeSchema = Schema({
    userId: {
        type: String,
    },
    code: {
        type: String
    },

});
module.exports = model( 'UserSpotifyCode', UserSpotifyCodeSchema );