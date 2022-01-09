const {httpError} = require('../helpers/handleError')
const userModel = require('../models/user.model')
const {addNewUser, getAllUsers, getOneUser} = require('../services/user.service');


const getItems = async (req, res) => {
    try {
        const allUsers = await getAllUsers(req)
        res.send({data: allUsers})
    } catch (error) {
        httpError(res, error) 
    }
}


const getItem = async (req, res) => {
    const id = req.params.id
    try {
        const user = await getOneUser(id)
        res.send({data: user})           
    } catch (error) {
        
    }
}

const createItem =  async (req, res) => {
    const user = req.body
    try {
        const testUser = await addNewUser(user)
        res.send({status: 200, data: testUser, message: "added" })    
    } catch (error) {
        httpError(res, error)
        
    }

}








const updateItem = (req, res) => {

}

const deleteItem = (req, res) => {

}

module.exports = {getItem, getItems, createItem, updateItem, deleteItem}





////////////////////////////////////////////////////////////////////////////////////////////
// const getItems = async (req, res) => {
//     try {

//         const userList = await userModel.find({})
//         res.send({data: userList})

//     } catch (error) {
//         httpError(res, error)
        
//     }

// }

////////////////////////////////////////////////////////////////////////////////////////////

// const createItem =  async (req, res) => {
//     try {
//         const newUser = req.body
//         const resDetail = await userModel.create(newUser)
//         res.send({data: resDetail})

//     } catch (error) {
//         httpError(res, error)
        
//     }

// }