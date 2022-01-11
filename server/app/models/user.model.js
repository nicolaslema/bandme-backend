const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({

    id:{
        type:String,
        default: null
    },
    displayName:{
        type:String,
        required: true
    },

    firstName:{
        type:String
    },

    lastName:{
        type:String
    },

    profilePhoto:{
        type: String
    },

    source:{
        type: String
    },

    role:{
        type:String
    },

    age:{
        type:Number
    },
    
    password:{
        type:String,
    },

    email:{
        type:String,
        require: true,
        unique: true
    },
   
   

},

{
    timestamps: true,
    versionKey: false

})


//Siempre que se modifique la password, la encrypta automaticamente antes de ejecutar "save" o "create" en la base de datos
userSchema.pre('save', function(next){
    const user = this;
    if(!user.isModified('password')) return next();
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10))
    next()
})



module.exports = mongoose.model('users', userSchema)