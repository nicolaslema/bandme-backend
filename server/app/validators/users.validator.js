const {check} = require('express-validator')
const {validateResult} = require('../helpers/validateHelpers')

const validateCreate = [ 

    check('name')
    .exists()
    .not()
    .isEmpty(),

    check('age')
    .exists()
    .not()
    .isEmpty()
    .isNumeric()
    .custom((value, { req }) => {
        //TODO: 18
        if (value < 18 || value > 40) {
            throw new Error('Debes tener 18 para registrarte')
        }
        return true
    }),

    check('email')
    .exists()
    .not()
    .isEmpty()
    .isEmail(),

    check('password')
    .exists()
    .not()
    .isEmpty(),

    (req, res, next) => {
        validateResult(req, res, next)
    }

]

module.exports = {validateCreate}