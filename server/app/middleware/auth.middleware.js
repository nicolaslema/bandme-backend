module.exports ={


    //@desc No usar
    ensureAuth: function(req,res,next){
        if(req.isAuthenticated()){
            return next()
        } else {
            res.redirect('/api/1.0/')
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
}