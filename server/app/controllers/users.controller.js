const {httpError} = require('../helpers/handleError')
const userModel = require('../models/user.model')


const getItems = async (req, res) => {
    try {

        const userList = await userModel.find({})
        res.send({data: userList})

    } catch (error) {
        httpError(res, error)
        
    }

}

const getItem = (req, res) => {

}

const createItem =  async (req, res) => {
    try {
        const newUser = req.body
        const resDetail = await userModel.create(newUser)
        res.send({data: resDetail})

    } catch (error) {
        httpError(res, error)
        
    }

}

const updateItem = (req, res) => {

}

const deleteItem = (req, res) => {

}

module.exports = {getItem, getItems, createItem, updateItem, deleteItem}