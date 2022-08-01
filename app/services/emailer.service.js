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
        console.log('codigo de confirmacion: '+ code);
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
        console.log('Email al cual enviar el codigo de autenticacion: ' + email);
        console.log('User ID: ' + userId);
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
            console.log('Codigo y userId asociados: ' + JSON.stringify(userCodeAssociated));
        }else{
            const userCodeReset = new UserCodeReset({userId, code});
            const userCodeResetAssociated = await userCodeReset.save();

            const datos = await UserCodeReset.findOne({code: code});
            console.log("VALOOOR: ", datos)
            
            console.log('Codigo y userId asociados para el reinicio de clave: ' + JSON.stringify(userCodeResetAssociated));
        }
        
    }

    async confirmAccount (code) {
        let confirmAccountResponse = {isConfirm: false, message: ''};
        try {
           //Cambiar codeStatus a 'used'
           const userId = await this.updateCodeStatus(code);
           //Cambiar accountStatus a 'enable'
           const isReadyToJwt = await this.updateAccountStatus(userId);
           console.log('listo para generar el jwt?: ' + isReadyToJwt);
                            
            const jwtCreated = await this.createJWT(userId);
            if(jwtCreated == false || jwtCreated == null || jwtCreated.length == 0){
                console.log('Error al generar el jwt su valor ->: '+ jwtCreated);
                return confirmAccountResponse = {
                    isConfirm: false,
                    message: 'JWT is no created'
                };
            }
            return confirmAccountResponse = {
                isConfirm: true,
                jwt: jwtCreated,
                message: 'Account Confirmed'
            }
    
        } catch (error) {
            console.log('Catch: Error al confirmar la cuenta en el Service: ' + error);
            return confirmAccountResponse = {
                isConfirm: false,
                message: 'Confirm account was failed'
            };
        }
    }

    async updateCodeStatus(code){
        try{
            const userCodeData = await userCodeModel.findOneAndUpdate({code: code}, { codeStatus: 'used' }, {new: true});
            console.log('codeStatus para confirmar cuenta: '+ JSON.stringify(userCodeData));
            console.log('id del usuario para buscar: ' + userCodeData.userId);
             return userCodeData.userId;

        } catch (error) {
            console.log('Catch: Error al actualizar codeStatus: ' + error);
            return 'sin codigo';
        }
    }

    async updateAccountStatus(userId){
        try{
            const userData = await userModel.findOneAndUpdate({_id: userId}, { accountStatus: 'enable' }, {new: true});
            console.log('accountStatus para confirmar cuenta: '+ JSON.stringify(userData));
            return true;
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