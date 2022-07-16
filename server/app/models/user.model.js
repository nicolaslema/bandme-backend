const { Schema, model, mongoose } = require('mongoose');

const UserSchema = Schema({
    _id: mongoose.SchemaTypes.ObjectId,
    /* _id: {
        type: String
    }, */
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String
    },
    user_type: {
        type: String
    },
    provider: {
        type: String
    },
    profile_photo: {
        type: String,
    },
    isPremium: {
        type: Boolean
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    description: {
        type: String
    },
    social_media: {
        type: Array
    },
    post_list: {
        type: Array
    },
    friend_list: {
        type: Array
        /* _id: mongoose.SchemaTypes.ObjectId,
        first_name: String,
        last_name: String,
        profile_photo: String */
    },
    account_status: {
        type: String,
        default: 'enable'
    }
});

const User = model( 'User', UserSchema );

module.exports = User;
/* const { Schema, model } = require('mongoose');
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


module.exports = model( 'User', UserSchema ); */