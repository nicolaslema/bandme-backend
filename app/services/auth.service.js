const path = require('path');
const { httpError } = require(path.join(process.cwd(), 'app' ,'helpers', 'handleError'));
const userModel = require(path.join(process.cwd(), 'app' ,'models', 'user.model'));
const User = require(path.join(process.cwd(), 'app' ,'models', 'user.model'));
const UserSpotifyCode = require(path.join(process.cwd(), 'app' ,'models', 'user-spotify'));
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const EmailerService = require(path.join(process.cwd(), 'app' ,'services', 'emailer.service'));
const userCodeResetModel = require('../models/user-code-reset.model');
const axios = require('axios').default;

class AuthService {
    
    constructor(){
        this.message = 'AuthService instance created';
    }
    //ACA ESTA FALLANDO
    async validateSpotifyToken(token, provider, codeSpotify){
        
        let finalResponse = {existEmail: false, jwt: "", finishRegister: false, isProviderError: false, message: "", spotify_user_data: {}};
        try{
            const headersToken = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+ token
            }
    
            const {data:response} = await axios.get('https://api.spotify.com/v1/me', {
                headers: headersToken
            });

            const loginResponse = await this.validateExistEmail(response.email);

            //const id = JSON.stringify(loginResponse.userId);
            //findById(userUid)
            const userSpotify = await UserSpotifyCode.findOne({userId: loginResponse.userId});
            let isNewAccount = false;
            if(userSpotify != null && userSpotify != undefined && userSpotify != '' && loginResponse.userId != '' && loginResponse.userId != undefined && loginResponse.userId != null){
                //actualizar code
                isNewAccount = false;
                await UserSpotifyCode.updateOne({userId: loginResponse.userId},{
                    code: codeSpotify
                });
            }else{
                isNewAccount = true;
                const userSpotifyCode = new UserSpotifyCode({userId: "", code: codeSpotify});
                const userSpotifyCodeSaved = await userSpotifyCode.save();
            }
            if(loginResponse.existEmail == true){
                finalResponse = {
                    existEmail: loginResponse.existEmail,
                    jwt: loginResponse.jwt,
                    finishRegister: loginResponse.finishRegister,
                    isProviderError: loginResponse.isProviderError,
                    message: loginResponse.message
                }
            }else{
                let imagenSpotify;
                if(response.images[0]!= null && response.images[0] != undefined && response.images[0] != '' && response.images[0].length > 0){
                    imagenSpotify = response.images[0].url
                }else{
                    imagenSpotify = ""
                }
                if(isNewAccount == true){
                    finalResponse = {
                        existEmail: loginResponse.existEmail,
                        jwt: loginResponse.jwt,
                        finishRegister: loginResponse.finishRegister,
                        isProviderError: loginResponse.isProviderError,
                        message: loginResponse.message,
                        spotify_user_data: {
                            email: response.email,
                            profilePhoto: imagenSpotify, 
                            firstName: response.display_name,
                            provider: provider,
                            codeSpotify: codeSpotify
                        },
                    }
                }else{
                    finalResponse = {
                        existEmail: loginResponse.existEmail,
                        jwt: loginResponse.jwt,
                        finishRegister: loginResponse.finishRegister,
                        isProviderError: loginResponse.isProviderError,
                        message: loginResponse.message,
                        spotify_user_data: {
                            email: response.email,
                            profilePhoto: imagenSpotify, 
                            firstName: response.display_name,
                            provider: provider
                        },
                        codeSpotify: ""
                    }
                }
            }
            
        }catch(error){
            console.log("Error catch obteniendo datos del usuario: " + error);
            finalResponse = {
                existEmail: false,
                jwt: '',
                finishRegister: false,
                isProviderError: false,
                message: "Ocurrió un error al buscar los datos del usuario en Spotify"
            }
        }
        return finalResponse;
    }

    async validateSpotifyCode(code, provider){
        let finalResponse = {existEmail: false, jwt: "", finishRegister: false, isProviderError: false, message: "", spotify_user_data: {}};
        try{
            const params = new URLSearchParams();
            params.append('code', code);
            params.append('grant_type', 'authorization_code');
            params.append('redirect_uri', process.env.SPOTIFY_REDIRECT_URI);

            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': process.env.AUTH_CODE_SPOTIFY
            }

            const {data:response} = await axios.post('https://accounts.spotify.com/api/token', params, {
                headers: headers
            });
            if(response.access_token != undefined && response.access_token != null && response.access_token != ''){
                const responseUserData = await this.validateSpotifyToken(response.access_token, provider, response.refresh_token);
                finalResponse = {
                    existEmail: responseUserData.existEmail,
                    jwt: responseUserData.jwt,
                    finishRegister: responseUserData.finishRegister,
                    isProviderError: responseUserData.isProviderError,
                    spotify_user_data: responseUserData.spotify_user_data,
                    message: responseUserData.message
                }
            }else{
                finalResponse = {
                    existEmail: false,
                    jwt: '',
                    finishRegister: false,
                    isProviderError: false,
                    message: "Ocurrió un error con la autorización de Spotify"
                }
            }
            
        }catch(error){
            console.log("Error buscando el token de spotify: " + error);
            finalResponse = {
                existEmail: false,
                jwt: '',
                finishRegister: false,
                isProviderError: false,
                message: "Ocurrió un error con la autenticación de Spotify"
            }
        }
        return finalResponse;
    }

    async resetPassword(newPassword, userUid){
        let resetPasswordResponse = {
            wasUpdated: false,
            jwt: '',
            message: ''
        }
        try{
            const hashPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
            await userModel.updateOne({_id: userUid}, {
                password: hashPassword
            });
            const jwtCreated = await this.createJWT(userUid);
                if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                    resetPasswordResponse = {
                        wasUpdated: true,
                        jwt: '',
                        message: 'Error al creaco jwt'
                    }
                } else {
                    resetPasswordResponse = {
                        wasUpdated: true,
                        jwt: jwtCreated,
                        message: 'Password actualizada correctamente'
                    }
                }
        }catch(error){
            console.log('Error al actualizar la password: ', error);
            resetPasswordResponse = {
                wasUpdated: false,
                jwt: '',
                message: ''
            }
        }
        return resetPasswordResponse;
    }


    async validateResetPasswordCode(resetCode){
        let validateCode = {isValid: false, jwt: '', message: ''}
        try{
            const userCodeResetAssociated = await userCodeResetModel.findOne({code: resetCode});
            if(userCodeResetAssociated.userId != undefined && userCodeResetAssociated.codeStatus == 'not used'){
                const updateCode = await userCodeResetModel.updateOne({_id: userCodeResetAssociated._id}, {
                    codeStatus: 'used'
                });
                
                const jwtCreated = await this.createJWT(userCodeResetAssociated.userId);
                    if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                        validateCode = {
                            isValid: true,
                            jwt: jwtCreated,
                            message: 'Codigo validado y error al generar jwt'
                        }
                    } else {
                        validateCode = {
                            isValid: true,
                            jwt: jwtCreated,
                            message: 'Codigo validado y jwt generado'
                        }
                    }
    
            }else{
                console.log('false devolver error');
                validateCode = {
                    isValid: false,
                    jwt: '',
                    message: 'Error al validar el codigo'
                }
            }
        }catch(error){
            console.log('false devolver error: ', error);
            validateCode = {
                isValid: false,
                jwt: '',
                message: 'Error al validar el codigo por fallo en la busqueda'
            }
        }
        return validateCode;
    }   

    async validateExistEmailResetPassword(userEmail) {
        //1. Validar si existe en la DB el email del usuario
        let validateEmail = {emailValid: false, message: '', sentEmail: false};
        try {
            const {email, _id} = await userModel.findOne({email: userEmail});
            if(email != null && email != undefined && email == userEmail) {
                const emailerService = EmailerService;
                const code = emailerService.generateConfirmationCode();
                await emailerService.associateCodeToUser(code, _id, true);
                const result = await emailerService.sendResetPasswordEmail(email, code);
                if(result){
                    validateEmail = {emailValid: true, message: 'Se envio el mail para restrablecer la clave', sentEmail: true};
                }else{
                    validateEmail = {emailValid: true, message: 'No se envio el mail para restrablecer la clave', sentEmail: false};
                }
            }else{
                validateEmail = {
                    emailValid: false,
                    message: 'No es un email autenticado',
                    sentEmail: false
                }
            }   
        }catch(error){
            console.log('Error al buscar el email en la base de datos: ', error);
            validateEmail = {
                emailValid: false,
                message: 'No se pudo encontrar el email ingresado',
                sentEmail: false
            }
        }
        return validateEmail;
    }

    async validateExistEmail(validateEmail) {
        let validateUserExist = {existEmail: false, jwt: "", finishRegister: false, isProviderError: false, message: "", userId: ""};
        try {
            const user = await userModel.findOne({email: validateEmail});
            if (user != null && user.email == validateEmail) {
                const { account_status, email, _id, provider } = user;
                if(provider == "EMAIL"){
                    if(account_status == "enable"){
                        const jwtCreated = await this.createJWT(user._id);
                        if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                            validateUserExist.existEmail = false;
                            validateUserExist.jwt = "";
                            validateUserExist.message = "Error al generar jwt"
                            return validateUserExist;
                        } else {
                            validateUserExist.existEmail = true;
                            validateUserExist.jwt = jwtCreated;
                            validateUserExist.message = "Email validado"
                        }
                    }else{
                        //enviar mail
                        const emailerService = EmailerService;
                        const emailSended = await emailerService.sendConfirmationEmail(email, _id);
                        if ( emailSended ) {
                            validateUserExist.finishRegister = true,
                            //validateUserExist.existEmail = true,
                            validateUserExist.message = "Se envio email para finalizar el registro"
                        } else {
                            validateUserExist.message = "No se pudo continuar con el proceso de activación de cuenta"
                        }
                    }
                }else{

                    if(account_status == "enable"){
                        const jwtCreated = await this.createJWT(user._id);
                        if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                            validateUserExist.existEmail = false;
                            validateUserExist.jwt = "";
                            validateUserExist.message = "Error al generar jwt"
                            return validateUserExist;
                        } else {
                            validateUserExist.existEmail = true;
                            validateUserExist.jwt = jwtCreated;
                            validateUserExist.isProviderError = true;
                            validateUserExist.message = "Email registrado a traves de Google o Spotify",
                            validateUserExist.userId = _id
                        }
                    }else{
                        //enviar mail
                        const emailerService = EmailerService;
                        const emailSended = await emailerService.sendConfirmationEmail(email, _id);
                        if ( emailSended ) {
                            validateUserExist.finishRegister = true,
                            //validateUserExist.existEmail = true,
                            validateUserExist.message = "Se envio email para finalizar el registro",
                            validateUserExist.userId = _id
                        } else {
                            validateUserExist.message = "No se pudo continuar con el proceso de activación de cuenta"
                        }
                    }
                }
                
            } else{
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

    async decodeToken(token) {
        let validateUserExist = {uid: "", user_exist: false};
        try{
            const result = jwt.verify(token, process.env.JWT_SECRET);
            validateUserExist.uid = result.id;
            validateUserExist.user_exist = true;
        } catch (error){
            console.log('fallo la desencriptacion de token en service: ' + error);
        }
        return validateUserExist;
    }


    async createJWT (userId){
        try {
            return jwt.sign({id: userId}, process.env.JWT_SECRET,{
                expiresIn: 900000,
            });
        } catch(error) {
            return false;
        }
    };

    comparePasswords(passwordFromRequest, originPassword){
        const comparePasswordsResult = bcrypt.compareSync(passwordFromRequest, originPassword);
        return comparePasswordsResult;
    }

    async validateLoginByEmail(validateEmail, validatePassword) {
        let userLoginResponse = {isAuthenticated: false, user: {}};
        const userData = await userModel.findOne({email: validateEmail});
        //1 verifico si existe el email en la base para saber si es un login o un registro
        if (userData != null && userData.email == validateEmail) {
            //2.bis si exite es un login, entonces tengo que comparar las passwords la que llega y la que esta en la base
            const passwordValidation = this.comparePasswords(validatePassword, userData.password);
            if(passwordValidation){
                //3 si coinciden genero el jwt y responde
                const jwtCreated = await this.createJWT(userData._id);
                if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
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
                userLoginResponse.user = {userAuthenticated};
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

    async createAccountByEmail(email, newPassword, user_type, provider) {

        const filePath = "uploads/profile_default.png"

        let userRegister = { accountCreated: false, userData: {} }
        try {
            if(email != null && newPassword != null && user_type != null){
                const password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
                const user = new User({email, password, user_type, provider, isPremium: false, profile_phot: filePath});
                const registeredUser = await user.save();
                const userAccountDataToSend = {
                    email: registeredUser.email,
                    userType: registeredUser.user_type
                }
                
                const userAccount = {
                    user_data: userAccountDataToSend,
                }
                
                const emailerService = EmailerService;
                const emailSended = await emailerService.sendConfirmationEmail(registeredUser.email, registeredUser._id);
                if ( emailSended ) {
                    userRegister.accountCreated = true;
                    userRegister.userData = userAccount;
                } else {
                    userRegister.accountCreated = false;
                    userRegister.userData = {message: 'Error to send confirmation email'};
                }

            }
        } catch(error){
            userRegister.accountCreated = false;
            userRegister.userData = {};
        }
        return userRegister;
    };

    async createAccountBySocialMedia(email, provider, user_type, profile_photo, first_name, last_name, codeSpotify) {
        const isPremium = false;
        let userRegister = { accountCreated: false, userData: {} }
        try {
            let user;
            if(email != null && provider != null && user_type != null){
                if(last_name != undefined && last_name != null && last_name != ''){
                    user = new User({email, user_type, provider, profile_photo, first_name, last_name, isPremium});
                }else{
                    user = new User({email, user_type, provider, profile_photo, first_name, isPremium});
                }
                const registeredUser = await user.save();
                if(provider == "SPOTIFY"){
                    const result = await UserSpotifyCode.updateOne({code: codeSpotify},{
                        userId: registeredUser._id
                    });
                }
                let userAccountDataToSend;
                if(last_name != undefined && last_name != null && last_name != ''){
                    userAccountDataToSend = {
                        email: registeredUser.email,
                        profilePhoto: registeredUser.profile_photo,
                        firstName: registeredUser.first_name,
                        lastName: registeredUser.last_name,
                        provider: registeredUser.provider,
                        userType: registeredUser.user_type
                    }
                }else{
                    userAccountDataToSend = {
                        email: registeredUser.email,
                        profilePhoto: registeredUser.profile_photo,
                        firstName: registeredUser.first_name,
                        provider: registeredUser.provider,
                        userType: registeredUser.user_type
                    }
                };
                
                const userAccount = {
                    user_data: userAccountDataToSend,
                }

                const emailerService = EmailerService;
                const emailSended = await emailerService.sendConfirmationEmail(registeredUser.email, registeredUser._id);
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