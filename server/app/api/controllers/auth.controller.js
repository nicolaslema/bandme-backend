const { response } = require('express');
const path = require('path');
const AuthService = require(path.join(process.cwd(), 'app' ,'services', 'auth.service'));;//require('../../services/auth.service');

const validateEmail = async (req, res = response) => {
    const { email } = req.body;
    console.log('email de la request: '+ email);
    const authService = AuthService;
    console.log(authService.message);
    const existEmail = await authService.validateExistEmail(email);
    if ( existEmail ){
        res.status(200).json({
            exist_email: existEmail,
            message: 'Email validated'
        });
    } else {
        res.status(404).json({
            exist_email: existEmail,
            message: 'Email does not exist'
        });
    }
};

const validateLoginByEmail = async (req, res = response) => {
    const { email, password } = req.body;
    console.log("email de la request: "+ email + "/ pass de la request: "+ password);
    const authService = AuthService;
    const userLogin = await authService.validateLoginByEmail(email, password);
    if(userLogin.isAuthenticated){
        res.status(200).json({
            isAuthenticated: userLogin.isAuthenticated,
            user_data: userLogin.user
        });
    } else {
        res.status(404).json({
            isAuthenticated: userLogin.isAuthenticated,
            message: "Login failed, verify your credentials"
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
        userRegister = await authService.createAccountByEmaiil(email, password, userType, provider);
    }
    if(userRegister.accountCreated){
        res.status(200).json({
            accountCreated: userRegister.accountCreated,
            payload: userRegister.userData,
            message: 'Account created successfully'
        });
    } else {
        res.status(404).json({
            accountCreated: userRegister.accountCreated,
            message: "Account not created"
        });
    }

};

const validateEmailBySocialMedia = async (req, res = response) => {
    const { profilePhoto, firstName, lastName, email, provider } = req.user;
    console.log('email de la request by social media: '+ email);
    const authService = AuthService;
    const existEmail = await authService.validateExistEmail(email);
    if ( existEmail ){
        res.status(200).json({
            exist_email: existEmail,
            message: 'Email validated'
        });
    } else {
        res.status(404).json({
            exist_email: existEmail,
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
};

module.exports = {
    validateEmail,
    validateLoginByEmail,
    createAccount,
    validateEmailBySocialMedia
}





