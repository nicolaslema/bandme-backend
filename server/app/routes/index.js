const { Router } = require('express')
const express = require('express')
const router = express.Router()
const fs = require('fs')

const pathRouter = `${__dirname}`


//@desc Remueve las extensiones de los arcivos creados en el directorio routes
const removeExtension = (fileName) => {
    return fileName.split('.').shift()
}


//@desc Carga en el router todos los archivos creados en el directorio routes (menos index)
fs.readdirSync(pathRouter).filter((file) => {
    const fileWithOutExt = removeExtension(file)
    const skip = ['index'].includes(fileWithOutExt)
    if (!skip) {
        router.use(`/${fileWithOutExt}`, require(`./${fileWithOutExt}`)) //TODO: localhost/users
        console.log('RUTA CARGADA ---->', fileWithOutExt)
    }
})

//@desc Cualquier otra ruta no creada devuelve error 'not found'
router.get('*', (req, res) => {
    res.status(404)
    res.send({ error: 'Not found' })
})

module.exports = router