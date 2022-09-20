const { response } = require('express');
const path = require('path');
const EmailerService = require(path.join(process.cwd(), 'app' ,'services', 'emailer.service'));

const confirmAccount = async (req, res = response) => {
    const { code } = req.body;
    const { email } = req.body;
    console.log('code request: '+ code);
    console.log('email request: '+ email);
    
    try{
        const emailerService = EmailerService;
        console.log(emailerService.message);
        const accountConfirmed = await emailerService.confirmAccount(code, email);
        console.log('UserCodeData en controller: '+ JSON.stringify(accountConfirmed));    
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
                isEmailAssociated: accountConfirmed.isEmailAssociated
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