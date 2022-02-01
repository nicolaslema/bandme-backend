const { httpError } = require("../helpers/handleError");
const userModel = require("../models/user.model");
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthService {
    
    constructor(){}

    async validateExistEmail(validateEmail) {
        let existEmail = false;
        try {
            console.log("email antes de consultar la base: "+ validateEmail);
            const user = await userModel.findOne({email: validateEmail});
            if (user != null && user.email == validateEmail) {
                console.log("email encontrado luego de consultar la base: "+ user);
                existEmail = true;
            } else{
                console.log("email encontrado luego de consultar la base: "+ user);
                existEmail = false;
            }
        } catch (error) {
            existEmail = false;
            console.log('Error findOne email: ' + error);
            httpError(error);
        }
        return existEmail;
    };

    async createJWT (userId){
        try {
            return jwt.sign({id: userId}, process.env.JWT_SECRET,{
                expiresIn: 900000,
            });
        } catch(error) {
            console.log('Error al generar el JWT: '+ error);
            return false;
        }
    };

    async comparePasswords(passwordFromRequest, originPassword){
        const comparePasswordsResult = bcrypt.compareSync(passwordFromRequest, originPassword);
        console.log('Las passwords coinciden: '+ comparePasswords);
        return comparePasswordsResult;
    }

    async validateLoginByEmail(validateEmail, validatePassword) {
        let userLoginResponse = {isAuthenticated: false, user: {}};
        console.log("email y pass para buscar en la base: "+validateEmail+"//"+validatePassword);
        const userData = await userModel.findOne({email: validateEmail});
        console.log('usuario encontrado en la base: '+ userData);
        //1 verifico si existe el email en la base para saber si es un login o un registro
        if (userData != null && userData.email == validateEmail) {
            //2.bis si exite es un login, entonces tengo que comparar las passwords la que llega y la que esta en la base
            if(comparePasswords(validatePassword, userData._doc.password)){
                //3 si coinciden genero el jwt y responde
                const jwtCreated = await this.createJWT(userData._id);
                if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                    console.log('Error al generar el jwt su valor ->: '+ jwtCreated);
                    userLoginResponse.isAuthenticated = false;
                    userLoginResponse.user = {message: 'JWT is no created'};
                    return userLoginResponse;
                }
                const userAuthenticated = {
                    email: userData.email,
                    userType: userData._doc.userType,
                    jwt: jwtCreated
                }
                userLoginResponse.isAuthenticated = true;
                userLoginResponse.user = userAuthenticated;
            } else {
                //4 si no coinciden devuelvo error con mensaje passwords no coinciden
                userLoginResponse.isAuthenticated = false;
                userLoginResponse.user = {message: 'Incorrect password'};
            }
        } else{
            //2 si no existe es un registro entonces envio respuesta
            userLoginResponse.isAuthenticated = false;
            userLoginResponse.user = {};
        }
        return userLoginResponse;
    };

    async createAccountByEmaiil(email, password, userType, provider) {
        console.log('datos del usuario para registrar: '+ email+"/"+password+"/"+userType);
        let userRegister = { accountCreated: false, userData: {} }
        try {
            if(email != null && password != null && userType != null){
                const user = new User({email, password, userType, provider});
                const registeredUser = await user.save();
                console.log('usuario registrado: '+ registeredUser);
                const userAccountDataToSend = {
                    email: registeredUser.email,
                    userType: registeredUser.userType
                }

                const jwtCreated = await this.createJWT(registeredUser._id);
                if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                    console.log('Error al generar el jwt su valor ->: '+ jwtCreated);
                    userLoginResponse.isAuthenticated = false;
                    userLoginResponse.user = {message: 'JWT is no created'};
                    return userLoginResponse;
                }
                
                const userAccount = {
                    user_data: userAccountDataToSend,
                    jwt: jwtCreated
                }
                userRegister.accountCreated = true;
                userRegister.userData = userAccount;
            }
        } catch(error){
            console.log('Error al registrar el usuario: '+error);
            userRegister.accountCreated = false;
            userRegister.userData = {};
        }
        return userRegister;
    };

    async createAccountBySocialMedia(email, provider, userType, profilePhoto, firstName, lastName) {
        console.log('datos del usuario para registrar: '+ email+"/"+provider+"/"+userType+"/"+profilePhoto+"/"+firstName+"/"+lastName);
        let userRegister = { accountCreated: false, userData: {} }
        try {
            if(email != null && provider != null && userType != null){
                const user = new User({email, userType, provider, profilePhoto, firstName, lastName});
                const registeredUser = await user.save();
                console.log('usuario registrado: '+ registeredUser +" // ");
                const userAccountDataToSend = {
                    email: registeredUser.email,
                    profilePhoto: registeredUser.profilePhoto,
                    firstName: registeredUser.firstName,
                    lastName: registeredUser.lastName,
                    provider: registeredUser.provider,
                    userType: registeredUser.userType
                }

                const jwtCreated = await this.createJWT(registeredUser._id);
                if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                    console.log('Error al generar el jwt su valor ->: '+ jwtCreated);
                    userLoginResponse.isAuthenticated = false;
                    userLoginResponse.user = {message: 'JWT is no created'};
                    return userLoginResponse;
                }
                
                const userAccount = {
                    user_data: userAccountDataToSend,
                    jwt: jwtCreated
                }
                userRegister.accountCreated = true;
                userRegister.userData = userAccount;
            }
        } catch(error){
            console.log('Error al registrar el usuario: '+error);
            userRegister.accountCreated = false;
            userRegister.userData = {};
        }
        return userRegister;
    };

};

module.exports = { AuthService }