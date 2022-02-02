const passport = require('passport');
const path = require('path');
const { Router } = require('express');
const { check } = require('express-validator');
const { validateRequestFields } = require(path.join(process.cwd(), 'app' ,'helpers', 'validateHelpers'));//require('../../helpers/validateHelpers');
const { validateEmail, validateLoginByEmail, createAccount, validateEmailBySocialMedia } = require(path.join(process.cwd(), 'app', 'api', 'controllers', 'auth.controller'));//require('../controllers/auth.controller');
//Passport Google
require(path.join(process.cwd(), 'app' ,'config', 'passport-google'))(passport);
//Passport Facebook
const passportFacebook = require(path.join(process.cwd(), 'app' ,'config', 'passport-facebook'))//require('../../config/passport-facebook');

const router = Router();

router.get('/', (req, res)=>{
    res.send('hola mundo')
})

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