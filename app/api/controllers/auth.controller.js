const { response } = require('express');
const path = require('path');
const AuthService = require(path.join(process.cwd(), 'app' ,'services', 'auth.service'));

const validateEmail = async (req, res = response) => {
    const { email } = req.body;
    console.log('email de la request: '+ email);
    const authService = AuthService;
    console.log(authService.message);
    const validateUserExist = await authService.validateExistEmail(email);
    console.log('email antes de entrar al if del controller: '+ validateUserExist.existEmail);
    try{
        if ( validateUserExist.existEmail ){
            res.status(200).json({
                exist_email: validateUserExist.existEmail,
                message: 'Email validated',
                jwt: validateUserExist.jwt
            });
        } else {
            res.status(200).json({
                exist_email: validateUserExist.existEmail,
                message: 'Email does not exist'
            });
        }
    } catch (error) {
        console.log('Catch: Error al validar si existe el email');
        res.status(500).json({
            exist_email: false,
            message: 'Email validation failed'
        });
    }
};

const validateLoginByEmail = async (req, res = response) => {
    const { email, password } = req.body;
    console.log("email de la request: "+ email + "/ pass de la request: "+ password);
    const authService = AuthService;
    const userLogin = await authService.validateLoginByEmail(email, password);
    try {
        if(userLogin.isAuthenticated){
            res.status(200).json({
                isAuthenticated: userLogin.isAuthenticated,
                user_data: userLogin.user
            });
        } else {
            res.status(200).json({
                isAuthenticated: userLogin.isAuthenticated,
                message: "Login failed, verify your credentials"
            });
        };
    } catch (error) {
        console.log('Error al validar si existe el email');
        res.status(500).json({
            isAuthenticated: userLogin.isAuthenticated,
            message: "Login validation failed"
        });
    }
}

const createAccount = async (req, res = response) => {
    const { email, provider, userType } = req.body;
    console.log("email de la request: "+ email + "/ provider de la request: "+ provider + "/ userType de la request: "+ userType);
    let userRegister = {accountCreated: false};
    const authService = AuthService;
    if(provider == "GOOGLE" || provider == "FACEBOOK"){
        const { profilePhoto, firstName, lastName } = req.body;
        userRegister = await authService.createAccountBySocialMedia(email, provider, userType, profilePhoto, firstName, lastName);
    } else {
        const { password } = req.body;
        userRegister = await authService.createAccountByEmail(email, password, userType, provider);
    }
    try {
        if(userRegister.accountCreated){
            res.status(200).json({
                accountCreated: userRegister.accountCreated,
                payload: userRegister.userData,
                message: 'Account created successfully'
            });
        } else {
            res.status(200).json({
                accountCreated: userRegister.accountCreated,
                message: "Account not created"
            });
        }
    } catch(error) {
        console.log('Error al crear cuenta');
        res.status(500).json({
                accountCreated: false,
                message: "Create account failed"
            });
        }   
    };

const DecodeUserToken = async(req, res = response) => {
    const { token } = req.body;
    console.log("El token recibido es: " + token);
    try{
        const authService = AuthService;
        const userData = await authService.decodeToken(token);
        console.log("User id obtenido: " + userData.uid);
        if(userData.user_exist){
            res.status(200).json({
                uid: userData.uid,
                user_exist: userData.user_exist,
                message: 'User exist'
            });
        } else {
            res.status(200).json({
                uid: userData.uid,
                user_exist: userData.user_exist,
                message: 'User does not exist'
            });
        }
    }catch(error){
        console.log('Error al desencriptar token controller: '+ error);
        res.status(404);
    }
}


const validateEmailBySocialMedia = async (req, res = response) => {
    const { profilePhoto, firstName, lastName, email, provider } = req.user;
    console.log('email de la request by social media: '+ email);
    try{
        const authService = AuthService;
        const validateUserExist = await authService.validateExistEmail(email);
        console.log('controller if: ' + validateUserExist.existEmail);
        if ( validateUserExist.existEmail ){
            res.status(200).json({
                exist_email: validateUserExist.existEmail,
                message: 'Email validated',
                jwt: validateUserExist.jwt
            });
        } else {
            res.status(200).json({
                exist_email: validateUserExist.existEmail,
                user_data: {
                    email,
                    profilePhoto, 
                    firstName, 
                    lastName,
                    provider
                },
                message: 'Email does not exist'
            });
        }
    }catch (error) {
        console.log('Error al iniciar el servicio de validacion de email by social media: '+ error);
        res.status(404);
    }
    
};

const validateEmaiResetPassword = async (req, res = response) => {
    const { email } = req.body;
    console.log('email de la request: '+ email);
    const authService = AuthService;
    const validateEmailExist = await authService.validateExistEmailResetPassword(email);
    try{
        if ( validateEmailExist.emailValid && validateEmailExist.sentEmail){
            res.status(200).json({
                emailValid: validateEmailExist.emailValid,
                message: validateEmailExist.message,
                sentEmail: validateEmailExist.sentEmail
            });
        } else {
            res.status(400).json({
                emailValid: validateEmailExist.emailValid,
                message: validateEmailExist.message,
                sentEmail: validateEmailExist.sentEmail
            });
        }
    } catch (error) {
        console.log('Catch: Error al validar si existe el email');
        res.status(500).json({
            emailValid: false,
            message: 'Email validation failed',
            sentEmail: false
        });
    }
};

const validateResetCode = async (req, res = response) => {
    const { code } = req.body;
    console.log('code de la request: '+ code);
    const authService = AuthService;
    const validateResetCode = await authService.validateResetPasswordCode(code);
    try{
        if (validateResetCode.isValid){
            res.status(200).json({
                isValid: validateResetCode.isValid,
                jwt: validateResetCode.jwt,
                message: validateResetCode.message
            });
        } else {
            res.status(400).json({
                isValid: validateResetCode.isValid,
                jwt: validateResetCode.jwt,
                message: validateResetCode.message
            });
        }
    } catch (error) {
        console.log('Catch: Error al validar si existe el email');
        res.status(500).json({
            isValid: false,
            jwt: '',
            message: 'Error al recibir el codigo'
        });
    }
};

const userResetPassword = async (req, res = response) => {
    const token = req.headers['auth-token'];
    const { newPassword } = req.body;
    console.log("nueva password: ", newPassword);
    const authService = AuthService;
    if(token != undefined){
        try{
            const {uid} = await authService.decodeToken(token);
            console.log("User id obtenido: " + uid);
            if(uid != '' && uid != undefined && uid != null){
                const validateResetPassword = await authService.resetPassword(newPassword, uid);
                console.log('RESPUESTA FINAL: ', validateResetPassword);
                if (validateResetPassword.wasUpdated){
                    res.status(200).json({
                        wasUpdated: validateResetPassword.wasUpdated,
                        jwt: validateResetPassword.jwt,
                        message: validateResetPassword.message
                    });
                } else {
                    res.status(400).json({
                        wasUpdated: validateResetPassword.wasUpdated,
                        jwt: validateResetPassword.jwt,
                        message: validateResetPassword.message
                    });
                }
            }else{
                console.log('No se pudo autenticar la identidad por que el token es incorrecto ');
                return res.status(500).json({
                    message: 'No se pudo autenticar la identidad'
                });
            }
        }catch(error){
            console.log('Catch: Error al validar si existe el email');
            res.status(500).json({
                wasUpdated: false,
                jwt: '',
                message: 'No se pudo realizar el reinicio de clave'
            });
        }
    }

};


module.exports = {
    validateEmail,
    validateLoginByEmail,
    createAccount,
    validateEmailBySocialMedia,
    DecodeUserToken,
    validateEmaiResetPassword,
    validateResetCode,
    userResetPassword
}