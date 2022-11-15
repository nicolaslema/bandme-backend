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
            console.log("DATOS DEL USER SPOTIFY ==> ", userSpotify);
            if(userSpotify != null && userSpotify != undefined && userSpotify != ''){
                //actualizar code
                await UserSpotifyCode.updateOne({userId: loginResponse.userId},{
                    code: codeSpotify
                });
            }else{
                const userSpotifyCode = new UserSpotifyCode({userId: loginResponse.userId, code: codeSpotify});
                const userSpotifyCodeSaved = await userSpotifyCode.save();
                console.log('USER SPOTIFY SAVED ==> ', userSpotifyCodeSaved);
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
                finalResponse = {
                    existEmail: loginResponse.existEmail,
                    jwt: loginResponse.jwt,
                    finishRegister: loginResponse.finishRegister,
                    isProviderError: loginResponse.isProviderError,
                    message: loginResponse.message,
                    spotify_user_data: {
                        email: response.email,
                        profilePhoto: response.images[0].url, 
                        firstName: response.display_name,
                        provider: provider
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
                console.log("spotify token ==> ", response.access_token);
                //response.refresh_token; guardar en documento en mongo asociando el _id del usuario

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

    //10. Y asi se le va a permitir ingresar la nueva password dos veces y las va a enviar a un nuevo servicio de 'ResetPassword' con el JWT temporal
    //10.1. Ese servicio va a tomar el JWT lo va a desenctriptar y va a obtener el id del usuario
    async resetPassword(newPassword, userUid){
        //11. Luego va a comparar las dos passwords y si coinciden las va a encriptar y las va a guardar
        let resetPasswordResponse = {
            wasUpdated: false,
            jwt: '',
            message: ''
        }
        try{
            console.log('newPassword: ', newPassword, ' // user id: ', userUid)
            const hashPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
            await userModel.updateOne({_id: userUid}, {
                password: hashPassword
            });
            console.log('Password actualizada, uid del usuario: ', userUid);
            //12. Se va a generar un nuevo JWT y se va a enviar una respuesta de success junto con el JWT para que pueda ahi mismo iniciar la sesion
            const jwtCreated = await this.createJWT(userUid);
                if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                    console.log('Error al generar el jwt su valor ->: '+ jwtCreated);
                    resetPasswordResponse = {
                        wasUpdated: true,
                        jwt: '',
                        message: 'Error al creaco jwt'
                    }
                } else {
                    console.log('JWT creado exitosamente ->: '+ jwtCreated);
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


    //5. El usuario va a ingresar ese codigo y lo va a enviar a un nuevo servicio que falta crear de 'ValidateResetPasswordCode'
    async validateResetPasswordCode(resetCode){
        let validateCode = {isValid: false, jwt: '', message: ''}
        //6. Ese servicio va a tomar el codigo y va a ir a ver si existe en la base de datos y obtener el id del usuario asociado a ese codigo
        const userCodeResetAssociated = await userCodeResetModel.findOne({code: resetCode});
        console.log('codigo encontrado: ', userCodeResetAssociated);
        //7. Si no es correcto devolver mensaje de error
        if(userCodeResetAssociated.userId != undefined && userCodeResetAssociated.codeStatus == 'not used'){
            console.log('true')
            const updateCode = await userCodeResetModel.updateOne({_id: userCodeResetAssociated._id}, {
                codeStatus: 'used'
            });
            console.log('Codigo actualizado: ', updateCode);
            
            //usar codigo
            //9. Si es correcto al usuario se le va a generar un JWT momentaneo que contiene su id y se le va a 
            //enviar en la respuesta
            const jwtCreated = await this.createJWT(userCodeResetAssociated.userId);
                if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                    console.log('Error al generar el jwt su valor ->: '+ jwtCreated);
                    validateCode = {
                        isValid: true,
                        jwt: jwtCreated,
                        message: 'Codigo validado y error al generar jwt'
                    }
                } else {
                    console.log('JWT creado exitosamente ->: '+ jwtCreated);
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
        return validateCode;
    }   

    async validateExistEmailResetPassword(userEmail) {
        //1. Validar si existe en la DB el email del usuario
        let validateEmail = {emailValid: false, message: '', sentEmail: false};
        try {
            const {email, _id} = await userModel.findOne({email: userEmail});
            console.log('Respuesta de email existente: ', email, ' // id del usuario: ', _id);
            if(email != null && email != undefined && email == userEmail) {
                //3. Si existe, primero debo generar un code-user-reset, un codigo asociado al usuario que tenga un status 
                const emailerService = EmailerService;
                const code = emailerService.generateConfirmationCode();
                console.log('codigo generado para el reset password: ', code);
                await emailerService.associateCodeToUser(code, _id, true);
                //4. Una vez generado el codigo random y asociado al id del usuario en un nuevo documento, se lo tengo que enviar por email
                const result = await emailerService.sendResetPasswordEmail(email, code);
                if(result){
                    validateEmail = {emailValid: true, message: 'Se envio el mail para restrablecer la clave', sentEmail: true};
                }else{
                    validateEmail = {emailValid: true, message: 'No se envio el mail para restrablecer la clave', sentEmail: false};
                }
            }else{
            //2. Si no existe devolver mensaje de error 'email no valido' o algo asi
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
            console.log("email antes de consultar la base: "+ validateEmail);
            const user = await userModel.findOne({email: validateEmail});
            if (user != null && user.email == validateEmail) {
                const { account_status, email, _id, provider } = user;
                if(provider == "EMAIL"){
                    if(account_status == "enable"){
                        console.log("email encontrado luego de consultar la base: "+ user);
                        console.log('id de mongo del usuario: ' + user._id);
                        const jwtCreated = await this.createJWT(user._id);
                        if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                            console.log('Error al generar el jwt su valor ->: '+ jwtCreated);
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
                        console.log('Antes de iniciar el envio de email');
                        const emailerService = EmailerService;
                        const emailSended = await emailerService.sendConfirmationEmail(email, _id);
                        console.log('Email de confirmacion fue enviado?: '+emailSended);
                        if ( emailSended ) {
                            validateUserExist.finishRegister = true,
                            //validateUserExist.existEmail = true,
                            validateUserExist.message = "Se envio email para finalizar el registro"
                        } else {
                            validateUserExist.message = "No se pudo continuar con el proceso de activación de cuenta"
                        }
                    }
                }else{
                    console.log("Email registrado por un provider distinto a EMAIL: "+ user);

                    if(account_status == "enable"){
                        console.log("email encontrado luego de consultar la base: "+ user);
                        console.log('id de mongo del usuario: ' + user._id);
                        const jwtCreated = await this.createJWT(user._id);
                        if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                            console.log('Error al generar el jwt su valor ->: '+ jwtCreated);
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
                        console.log('Antes de iniciar el envio de email');
                        const emailerService = EmailerService;
                        const emailSended = await emailerService.sendConfirmationEmail(email, _id);
                        console.log('Email de confirmacion fue enviado?: '+emailSended);
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
                console.log("email no encontrado luego de consultar la base else: "+ user);
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
            console.log('inicio de desenctriptacion de token actual service: ' + token);
            const result = jwt.verify(token, process.env.JWT_SECRET);
            console.log('valor del token: ' + JSON.stringify(result));
            validateUserExist.uid = result.id;
            validateUserExist.user_exist = true;
        } catch (error){
            console.log('fallo la desenctriptacion de token en service: ' + error);
        }
        return validateUserExist;
    }


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
        console.log('usuario encontrado en la base: '+ userData);
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

        console.log('datos del usuario para registrar: '+ email+"/"+newPassword+"/"+user_type);
        let userRegister = { accountCreated: false, userData: {} }
        try {
            if(email != null && newPassword != null && user_type != null){
                const password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
                const user = new User({email, password, user_type, provider, isPremium: false, profile_phot: filePath});
                const registeredUser = await user.save();
                console.log('usuario registrado: '+ registeredUser);
                const userAccountDataToSend = {
                    email: registeredUser.email,
                    userType: registeredUser.user_type
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

    async createAccountBySocialMedia(email, provider, user_type, profile_photo, first_name, last_name) {
        console.log('datos del usuario para registrar: '+ email+"/"+provider+"/"+user_type);
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
                console.log('usuario registrado: '+ registeredUser +" // ");
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

                console.log('Antes de iniciar el envio de email: REGISTERED USER DATA: '+registeredUser);
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