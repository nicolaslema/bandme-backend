const express = require('express')
const passport = require('passport')
const router = express.Router()



//@desc Agregando la autenticacion del token para las rutas en las que se indique 'passport.authenticate("jwt")
router.get('/', passport.authenticate("jwt", {session: false}), (req, res ) =>{
    res.json({message: "Private Area"})
})



module.exports = router