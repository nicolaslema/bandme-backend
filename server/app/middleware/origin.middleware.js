//@desc chekear el origin de la quest (no hace falta, fue para test)

const checkOrigin = (req, res, next) =>{    
    console.log(req.headers)
    next()
}








module.exports = checkOrigin