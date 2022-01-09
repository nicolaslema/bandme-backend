const { httpError } = require("../helpers/handleError");
const userModel = require("../models/user.model")

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
        console.log(user);
        return user 
    } catch (error) {
        httpError(error)  
    }
}




//TODO: all services


module.exports = { addNewUser, getAllUsers, getOneUser }