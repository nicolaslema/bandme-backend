const ProtonMail = require('protonmail-api');
const path = require('path');
const UserCode = require(path.join(process.cwd(), 'app' ,'models', 'user-code.model'));
const userCodeModel = require(path.join(process.cwd(), 'app' ,'models', 'user-code.model'));
const userModel = require(path.join(process.cwd(), 'app' ,'models', 'user.model'));
const User = require(path.join(process.cwd(), 'app' ,'models', 'user.model'));
const jwt = require('jsonwebtoken');
const UserCodeReset = require('../models/user-code-reset.model');
require("dotenv").config()
const nodemailer = require("nodemailer");
const e = require('express');

//https://mail.protonmail.com/

class EmailerService {

    constructor(){
        this.message = 'EmailerService instance created';
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL,
                pass: process.env.GMAIL_PASSWORD
            },
        });

    }

    generateConfirmationCode(){
        const code = Math.floor(1000 + Math.random() * 9000);
        return code;
    }
   

    async sendmail (mailOptions) {
        const resp = await this.transporter.sendMail(mailOptions);
        if(resp.rejected.length == 0){
            return true;
        }else{
            return false
        }
        
    }

    async sendResetPasswordEmail(email, code) {
        try {
            let mailOptions = {
                from: process.env.GMAIL,
                to: email,
                subject: 'Restablecer clave de su cuenta de Bandme',
                html: `Para cambiar su clave por favor ingrese el siguiente codigo en la pantalla de reinicio de clave de la aplicación: ${code}`,
            };
            return await this.sendmail(mailOptions);
        } catch (error) {
            console.log('Error para enviar el mail de reinicio de clave: ' + error);
            return false;
        }
    };

    async sendConfirmationEmail(email, userId) {
        try {
            const code = this.generateConfirmationCode();
            let mailOptions = {
                from: process.env.GMAIL,
                to: email,
                subject: 'Confirmar cuenta de Bandme',
                html: `Para confirmar la creación de su cuenta por favor ingrese el siguiente codigo en la aplicación: ${code}`,
            };

            this.associateCodeToUser(code, userId, false)
            /* const pm = await ProtonMail.connect({
                username: process.env.BANDME_EMAIL,
                password: process.env.BANDME_EMAIL_PASS
            });
    
            await pm.sendEmail({
                to: email,
                subject: 'Confirmar cuenta de Bandme',
                body: `Para confirmar la creación de su cuenta por favor ingrese el siguiente codigo en la aplicación: ${code}`
            });
            pm.close(); */
            return await this.sendmail(mailOptions);
        } catch (error) {
            console.log('Error para enviar el mail de confirmacion: ' + error);
            return false;
        }
    }

    async associateCodeToUser (code, userId, isResetPassword = false) {
        if(!isResetPassword){
            const userCode = new UserCode({userId, code});
            const userCodeAssociated = await userCode.save();
        }else{
            const userCodeReset = new UserCodeReset({userId, code});
            const userCodeResetAssociated = await userCodeReset.save();

            const datos = await UserCodeReset.findOne({code: code});
            
        }
        
    }

    async confirmAccount (code, userEmail) {
        let confirmAccountResponse = {isConfirm: false, message: '', jwt: '', emailWrong: false};
        try {
            const userData = await this.updateCodeStatus(code, userEmail);

            if(userData.isValid == true){
                const isReadyToJwt = await this.updateAccountStatus(userData.data);
                if(isReadyToJwt == true){
                    const jwtCreated = await this.createJWT(userData.data);
                    if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                        confirmAccountResponse = {
                            isConfirm: false,
                            message: 'JWT is no created'
                        };
                    }else{
                        confirmAccountResponse = {
                            isConfirm: true,
                            jwt: jwtCreated,
                            message: 'Account Confirmed'
                        }
                    }
                }else{
                    confirmAccountResponse = {
                        isConfirm: false,
                        jwt: "",
                        message: 'Confirm account was failed. Account status is enable'
                    }
                }
            }else{
                if(userData.isUsed == true){
                    confirmAccountResponse = {
                        isConfirm: false,
                        jwt: "",
                        message: 'Confirm account was failed. Code was used'
                    }
                }else if(userData.data == "null"){
                    confirmAccountResponse = {
                        isConfirm: false,
                        jwt: "",
                        message: 'Confirm account was failed. Code is not valid'
                    }
                } else if(userData.isEmailValid != ""){
                    confirmAccountResponse = {
                        isConfirm: false,
                        jwt: "",
                        message: 'El codigo no esta asociado al email',
                        emailWrong: true
                    }
                }
                else{
                    confirmAccountResponse = {
                        isConfirm: false,
                        jwt: "",
                        message: 'Confirm account was failed. Validation code failed. Account status is enable'
                    }
                }
            }
            return confirmAccountResponse;
        } catch (error) {
            console.log('Catch: Error al confirmar la cuenta en el Service: ' + error);
            return confirmAccountResponse = {
                isConfirm: false,
                message: 'Confirm account was failed'
            };
        }
    }

    async updateCodeStatus(code, userEmail){
        try{
            const userCodeData = await userCodeModel.findOne({code: code});
            let response = {
                isValid: false,
                data: "",
                isUsed: false,
                isEmailValid: ""
            };

            if(userCodeData == null){
                response = {
                    isValid: false,
                    data: "null",
                    isUsed: false,
                    isEmailValid: ""
                }
            }else{
                const { codeStatus }  = userCodeData;
                if(codeStatus == "used"){
                    response = {
                        isValid: false,
                        data: "",
                        isUsed: true,
                        isEmailValid: ""
                    }
                }else{
                    const user = await userModel.findById(userCodeData.userId);
                    const { email } = user;
                    if(email == userEmail){
                        const userCodeData = await userCodeModel.findOneAndUpdate({code: code}, { codeStatus: 'used' }, {new: true});
                        
                        response = {
                            isValid: true,
                            data: userCodeData.userId,
                            isUsed: false,
                            isEmailValid: ""
                        }
                    }else{
                        response = {
                            isValid: false,
                            data: "",
                            isUsed: false,
                            isEmailValid: "El email no esta asociado con el codigo"
                        }
                    }
                }
            }
            return response;
        } catch (error) {
            console.log('Catch: Error al actualizar codeStatus: ' + error);
            return 'sin codigo';
        }
    }

    async updateAccountStatus(userId){
        try{
            //preguntar primero si su estado ya estaba enable o no
            let response = false;
            const user = await userModel.findById(userId);
            const { account_status } = user;
            if(account_status != "enable") {
                const userData = await userModel.updateOne({_id: userId}, {
                    account_status: 'enable'
                });
                response = true;
            }else {
                response = false
            }
            return response;
        } catch (error) {
            console.log('Catch: Error al actualizar accountStatus: ' + error);
            return false;
        }
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

}

module.exports = new EmailerService();