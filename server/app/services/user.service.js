const { httpError } = require("../helpers/handleError");
const userModel = require("../models/user.model")

//TODO: Update, Delete

//FIXME:


const addNewUser =  async  (user) => {
    try {
        const newUser =  await userModel.create(user)
        return newUser;
    } catch (error) {
        httpError(error)
        console.log('error services')
    }
}

const getAllUsers = async (req) =>{
    try {
        const userList = await userModel.find({})
        return userList;
    } catch (error) {
        httpError(error)  
    }
}

const getOneUser = async(id) =>{
    try {
        const user = await userModel.findById(id);
        return user 
    } catch (error) {
        httpError(error)  
    }
}


const addGoogleUser = async(user)=>{
    try {
        const newUser = await userModel.create(user)
        return newUser;
    } catch (error) {
        httpError(error)
        
    }
}

const getUserByEmail = async(email) =>{
    try {
        return await userModel.findOne({email})
    } catch (error) {
        httpError(error)
    }
}






module.exports = { addNewUser, getAllUsers, getOneUser, getUserByEmail, addGoogleUser }