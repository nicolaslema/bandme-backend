const e = require("express");
const { httpError } = require("../helpers/handleError");
const usersModel = require("../models/users.model")
const User = require('../models/user.model');
const { response } = require("express");

//TODO: Update, Delete

//FIXME:

class AuthService {
    
    constructor(){}

    async validateExistEmail(validateEmail) {
        let existEmail = false;
        try {
            console.log("email antes de consultar la base: "+ validateEmail);
            const { email } = await usersModel.findOne({email: validateEmail});
            console.log("email encontrado luego de consultar la base: "+ email);
            if (email != null && email == validateEmail) {
                existEmail = true;
            } else{
                existEmail = false;
            }
        } catch (error) {
            existEmail = false;
            console.log('Error findOne email: ' + error);
            httpError(error);
        }
        return existEmail;
    };


    /* const user = new User({email: validateEmail, password: validatePassword});
        const result = await user.save(); */
    async validateLogin(validateEmail, validatePassword) {
        let userLoginResponse = {isAuthenticated: false, user: {}};
        console.log("email y pass para buscar en la base: "+validateEmail+"//"+validatePassword);
        const userData = await usersModel.findOne({email: validateEmail}); //obtengo todos los campos del usuario para enviar al front
        //falta comparar las passwords hasheadas
        //falta generar y enviar el JWT
        //falta agregar un handle error que devuelva codigos de errores que signifiquen cada caso de uso
        console.log('usuario encontrado en la base: '+ userData);
        
        if (userData != null && userData.email == validateEmail) {
            const userAuthenticated = {
                email: userData.email,
                jwt: 'asd123'
                //password: userData._doc.password,
            }
            userLoginResponse.isAuthenticated = true;
            userLoginResponse.user = userAuthenticated;
        } else{
            userLoginResponse;
        }
        return userLoginResponse;
    }
}

const addNewUser =  async  (user) => {
    try {
        const newUser =  await usersModel.create(user)
        return newUser;
    } catch (error) {
        httpError(error)
        console.log('error services')
    }
}

const getAllUsers = async (req) =>{
    try {
        const userList = await usersModel.find({})
        return userList;
    } catch (error) {
        httpError(error)  
    }
}

const getOneUser = async(id) =>{
    try {
        const user = await usersModel.findById(id);
        return user 
    } catch (error) {
        httpError(error)  
    }
}


const addGoogleUser = async(user)=>{
    try {
        const newUser = await usersModel.create(user)
        return newUser;
    } catch (error) {
        httpError(error)
        
    }
}

const getUserByEmail = async(email) =>{
    try {
        return await usersModel.findOne({email})
    } catch (error) {
        httpError(error)
    }
}











module.exports = { AuthService, addNewUser, getAllUsers, getOneUser, getUserByEmail, addGoogleUser }