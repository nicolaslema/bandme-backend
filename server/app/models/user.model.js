const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({

    firstName:{
        type:String
    },
    LastName:{
        type:String
    },
    displayName:{
        type:String
    },
    age:{
        type:Number
    },
    provider:{
        type:String
    },
    provider_id:{
        type:String
    },
    password:{
        type:String,
        require: true
    },
    email:{
        type:String,
        require: true
    },
    token:{
        type:String
    },

},

{
    timestamps: true,
    versionKey: false

})


//Siempre que se modifique la password, la encrypta automaticamente antes de ejecutar "save" en la base de datos
userSchema.pre('save', function(next){
    const user = this;
    if(!user.isModified('password')) return next();
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10))
    next()
})



module.exports = mongoose.model('users', userSchema)