const { validationResult } = require('express-validator');

const validateRequestFields = ( req, res, next ) => {
    const errors = validationResult(req);
    if( !errors.isEmpty ) {
        return res.status(400).json(errors);
    }
    next();
};

module.exports = {
    validateRequestFields
}

/* module.exports ={


    //@desc No usar
    ensureAuth: function(req,res,next){
        if(req.isAuthenticated()){
            return next()
        } else {
            res.redirect('/api/v1/login')
        }
    },

    //@desc No usar
    ensureGuest: function (req,res,next){
        if(req.isAuthenticated()){
            res.redirect('/users')
        }else{
            return next()
        }
    }
} */