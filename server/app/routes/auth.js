const express = require('express')
const passport = require('passport')
const {signUpWithEmailPassword, signInWithEmailPassword, } = require('../controllers/users.controller')
const {getUserByEmail} = require('../services/user.service')

const router = express.Router()


//@desc auth with google
//@route GET /api/1.0/auth/google
router.get('/google', passport.authenticate('google', {scope:['profile', 'email']}))


//@desc Google auth Callback
//@route GET /api/1.0/auth/google/callback
//@result JWTTOKEN
router.get('/google/callback', passport.authenticate('google', {failureRedirect:
    '/'}),
    async (req,res)=>{
        
        //FIXME: agregar servicio para desacoplar
        const existingUser =  await getUserByEmail(req.user.email)
        const token = existingUser.createToken()
        return res.json({existingUser, token})
    })


//@desc logout, destroy session, clear cookie
//@route GET /api/1.0/auth/logout
router.get('/logout', (req, res) =>{
    req.session.destroy(function(){
        res.clearCookie("connect.sid");
        res.redirect('/api/1.0/users')
    })
})



//@desc register with email and password
//@route POST /api/1.0/auth/register
router.post('/register', signUpWithEmailPassword, (req,res)=>{
    res.redirect('/api/1.0/users')
} )

//@desc login with email and password
//@route POST /api/1.0/auth/login

router.post('/login', signInWithEmailPassword, (req, res)=>{
    res.redirect('/api/1.0/users')
})











module.exports =  router