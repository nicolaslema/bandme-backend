const passport = require('passport');
const { Router } = require('express');
const { check } = require('express-validator');
const { validateRequestFields } = require('../../helpers/validateHelpers');
const { validateEmail, validateLoginByEmail, createAccount, validateEmailBySocialMedia } = require('../controllers/auth.controller');
//Passport Google
require('../../config/passport-google')(passport);
//Passport Facebook
const passportFacebook = require('../../config/passport-facebook');

const router = Router();

//Check if exist email
router.post('/validate/email', [
    check('email', 'Email is required').isEmail(),
    validateRequestFields
], validateEmail);

//Check if is register or login 
router.post('/validate/login', [
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
    validateRequestFields
], validateLoginByEmail);

//Create the user account
router.post('/create/account', [
    check('email', 'Email is required').isEmail(),
    check('provider', 'Provider is required').not().isEmpty(),
    check('userType', 'UserType is required').not().isEmpty(),
    validateRequestFields
], createAccount);

//Google
router.post('/google', passport.authenticate('google-verify-token'), validateEmailBySocialMedia);

//Facebook
router.post('/facebook', passport.authenticate('facebook-token', {session: false}), validateEmailBySocialMedia);   

module.exports =  router;