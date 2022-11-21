const { response } = require('express');
const path = require('path');
const EmailerService = require(path.join(process.cwd(), 'app' ,'services', 'emailer.service'));

const confirmAccount = async (req, res = response) => {
    const { code } = req.body;
    const { email } = req.body;
    
    try{
        const emailerService = EmailerService;
        const accountConfirmed = await emailerService.confirmAccount(code, email);
        if (accountConfirmed.isConfirm) {
            res.status(200).json({
                isConfirm: accountConfirmed.isConfirm,
                jwt: accountConfirmed.jwt,
                message: accountConfirmed.message
            });
        } else {
            res.status(200).json({
                isConfirm: false,
                message: accountConfirmed.message,
                emailWrong: accountConfirmed.emailWrong
            });
        }
    } catch (error) {
        console.log('Catch: '+ error);
        res.status(500).json({
            isConfirm: false,
            message: 'Account was not confirmed'
        });
    }
};

module.exports = { confirmAccount }