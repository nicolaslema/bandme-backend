const express = require('express')
const passport = require('passport')

const router = express.Router()


//@desc auth with google
//@route GET /api/1.0/auth/google
router.get('/google', passport.authenticate('google', {scope:['profile', 'email']}))



//@desc Google auth Callback
//@route GET /api/1.0/auth/google/callback
router.get('/google/callback', passport.authenticate('google', {failureRedirect:
    '/'}),
    (req,res)=>{
        res.redirect('/api/1.0/users')
    })



//@desc logout, destroy session, clear cookie
//@route GET /api/1.0/auth/logout

router.get('/logout', (req, res) =>{
    req.session.destroy(function(){
        res.clearCookie("connect.sid");
        res.redirect('/api/1.0/users')
    })
})


module.exports =  router