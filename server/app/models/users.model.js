const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({

    /* id:{
        type:String,
        default: null
    },
    displayName:{
        type:String,
       
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
    }, */

    email:{
        type:String,
        require: true,
        unique: true
    },
   
},

/* {
    timestamps: true,
    versionKey: false
} */)


//@desc Siempre que se modifique la password, la encrypta automaticamente antes de ejecutar "save" o "create" en la base de datos
/* userSchema.pre('save', function(next){
    const user = this;
    if(!user.isModified('password')) return next();
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10))
    next()
})

//@desc Compara las password 
userSchema.methods.comparePassword = function(password){
    const user = this;
    const userObject = user.toObject()
    return bcrypt.compareSync(password, userObject.password)
}
//@desc Asigna JWT token con el email
userSchema.methods.createToken = function(){
    const user = this;
    return jwt.sign({email: user.email}, process.env.JWT_SECRET,{
        expiresIn: 900000,
    })
}
 */



module.exports = mongoose.model('users', userSchema)