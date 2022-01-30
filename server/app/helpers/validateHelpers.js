const {validationResult} = require('express-validator')

const validateRequestFields = (req, res, next) => {
    try {
        validationResult(req).throw()
        return next()
    } catch (error) {
        res.status(400)
        res.send({erros: error.array()}) 
    }
}

module.exports = { validateRequestFields}