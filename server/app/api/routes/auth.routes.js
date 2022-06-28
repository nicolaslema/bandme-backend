const passport = require('passport');
const path = require('path');
const { Router } = require('express');
const { check } = require('express-validator');
const { DecodeUserToken } = require('../controllers/auth.controller');
const { validateRequestFields } = require(path.join(process.cwd(), 'app' ,'helpers', 'validateHelpers'));//require('../../helpers/validateHelpers');
const { validateEmail, validateLoginByEmail, createAccount, validateEmailBySocialMedia } = require(path.join(process.cwd(), 'app', 'api', 'controllers', 'auth.controller'));
const { confirmAccount } = require(path.join(process.cwd(), 'app', 'api', 'controllers', 'emailer.controller'));

//Passport Google
require(path.join(process.cwd(), 'app' ,'config', 'passport-google'))(passport);
//Passport Facebook
const passportFacebook = require(path.join(process.cwd(), 'app' ,'config', 'passport-facebook'))//require('../../config/passport-facebook');

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

//Confirm account
router.post('/confirm/account', [
    check('code', 'Code is required').not().isEmpty(),
    validateRequestFields
], confirmAccount);

router.post('/validate/user-identity', [
    check('token', 'Token is required').not().isEmpty(),
    validateRequestFields
], DecodeUserToken);

module.exports =  router;