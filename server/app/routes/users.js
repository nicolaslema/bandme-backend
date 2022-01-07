const express = require('express')
const router = express.Router()
const {getItems, getItem, deleteItem, updateItem, createItem} = require('../controllers/users.controller.js')
const checkOrigin = require('../middleware/origin.middleware')
const {validateCreate} = require('../validators/users.validator')



router.get('/', getItems)

router.post('/:id', getItem)

router.post('/', checkOrigin, validateCreate, createItem)

router.patch('/:id', updateItem)

router.delete('/:id', deleteItem)


module.exports = router