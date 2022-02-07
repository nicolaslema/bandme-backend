const path = require('path');
const { httpError } = require(path.join(process.cwd(), 'app' ,'helpers', 'handleError'));
const userModel = require(path.join(process.cwd(), 'app' ,'models', 'user.model'));
const User = require(path.join(process.cwd(), 'app' ,'models', 'user.model'));
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const EmailerService = require(path.join(process.cwd(), 'app' ,'services', 'emailer.service'));

class AuthService {
    
    constructor(){
        this.message = 'AuthService instance created';
    }

    async validateExistEmail(validateEmail) {
        let validateUserExist = {existEmail: false, jwt: ""};
        try {
            console.log("email antes de consultar la base: "+ validateEmail);
            const user = await userModel.findOne({email: validateEmail});
            if (user != null && user.email == validateEmail) {
                console.log("email encontrado luego de consultar la base: "+ user);
                console.log('id de mongo del usuario: ' + user._id);

                const jwtCreated = await this.createJWT(user._id);
                if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                    console.log('Error al generar el jwt su valor ->: '+ jwtCreated);
                    validateUserExist.existEmail = false;
                    validateUserExist.jwt = "Error al generar jwt";
                    return validateUserExist;
                } else {
                    validateUserExist.existEmail = true;
                    validateUserExist.jwt = jwtCreated;
                }
            } else{
                console.log("email encontrado luego de consultar la base else: "+ user);
                validateUserExist.existEmail = false;
                validateUserExist.jwt = "";
            }
        } catch (error) {
            validateUserExist.existEmail = false;
            validateUserExist.jwt = "";
            console.log('Error findOne email: ' + error);
            httpError(error);
        }
        return validateUserExist;
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

    comparePasswords(passwordFromRequest, originPassword){
        const comparePasswordsResult = bcrypt.compareSync(passwordFromRequest, originPassword);
        console.log('Las passwords coinciden: '+ comparePasswordsResult);
        return comparePasswordsResult;
    }

    async validateLoginByEmail(validateEmail, validatePassword) {
        let userLoginResponse = {isAuthenticated: false, user: {}};
        console.log("email y pass para buscar en la base: "+validateEmail+"//"+validatePassword);
        const userData = await userModel.findOne({email: validateEmail});
        console.log('usuario encontrado en la base: '+ userData.password);
        //1 verifico si existe el email en la base para saber si es un login o un registro
        if (userData != null && userData.email == validateEmail) {
            //2.bis si exite es un login, entonces tengo que comparar las passwords la que llega y la que esta en la base
            console.log('passwords para comparar: ' + validatePassword + "||" + userData.password);
            const passwordValidation = this.comparePasswords(validatePassword, userData.password);
            console.log('password validation: ' + passwordValidation);
            if(passwordValidation){
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

    async createAccountByEmail(email, password, userType, provider) {
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

                /* const jwtCreated = await this.createJWT(registeredUser._id);
                if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                    console.log('Error al generar el jwt su valor ->: '+ jwtCreated);
                    userLoginResponse.isAuthenticated = false;
                    userLoginResponse.user = {message: 'JWT is no created'};
                    return userLoginResponse;
                } */
                
                const userAccount = {
                    user_data: userAccountDataToSend,
                }//jwt: jwtCreated
                
                console.log('Antes de iniciar el envio de email');
                const emailerService = EmailerService;
                const emailSended = await emailerService.sendConfirmationEmail(registeredUser.email, registeredUser._id);
                console.log('Email de confirmacion fue enviado?: '+emailSended);
                if ( emailSended ) {
                    userRegister.accountCreated = true;
                    userRegister.userData = userAccount;
                } else {
                    userRegister.accountCreated = false;
                    userRegister.userData = {message: 'Error to send confirmation email'};
                }

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

                /* const jwtCreated = await this.createJWT(registeredUser._id);
                if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                    console.log('Error al generar el jwt su valor ->: '+ jwtCreated);
                    userLoginResponse.isAuthenticated = false;
                    userLoginResponse.user = {message: 'JWT is no created'};
                    return userLoginResponse;
                } */
                
                const userAccount = {
                    user_data: userAccountDataToSend,
                }//jwt: jwtCreated

                console.log('Antes de iniciar el envio de email');
                const emailerService = EmailerService;
                const emailSended = await emailerService.sendConfirmationEmail(registeredUser.email, registeredUser._id);
                console.log('Email de confirmacion fue enviado?: '+emailSended);
                if ( emailSended ) {
                    userRegister.accountCreated = true;
                    userRegister.userData = userAccount;
                } else {
                    userRegister.accountCreated = false;
                    userRegister.userData = {message: 'Error to send confirmation email'};
                }

            }
        } catch(error){
            console.log('Error al registrar el usuario: '+error);
            userRegister.accountCreated = false;
            userRegister.userData = {};
        }
        return userRegister;
    };

};

module.exports = new AuthService();