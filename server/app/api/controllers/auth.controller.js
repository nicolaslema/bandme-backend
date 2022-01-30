const e = require('express');
const { response } = require('express');
const passport = require('passport');
const {httpError} = require('../../helpers/handleError')
const userModel = require('../../models/users.model')
const {addNewUser, getAllUsers, getOneUser, getUserByEmail, AuthService} = require('../../services/auth.service');

const validateEmail = async (req, res = response) => {
    const { email } = req.body;
    console.log('email de la request: '+ email);
    const authService = new AuthService();
    const existEmail = await authService.validateExistEmail(email);
    if ( existEmail ){
        res.status(200).json({
            exist_email: existEmail,
            message: 'Email validated'
        });
    } else {
        res.status(204).json({
            exist_email: existEmail,
            message: 'Email does not exist'
        });
    }
};

const validateLogin = async (req, res = response) => {
    const { email, password } = req.body;
    console.log("email de la request: "+ email + "/ pass de la request: "+ password);
    const authService = new AuthService();
    const userLogin = await authService.validateLogin(email, password);
    if(userLogin.isAuthenticated){
        res.status(200).json({
            isAuthenticated: userLogin.isAuthenticated,
            user_data: userLogin.user
        });
    } else {
        res.status(404).json({
            isAuthenticated: userLogin.isAuthenticated,
            message: "Login failed, verify your credentials"
        });
    }
}

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


const signInWithEmailPassword = async(req, res) =>{
    const {email, password} = req.body
    //FIXME: agregar validator
    try {
        const existingUser = await getUserByEmail(email)

        if(!req.body.email ){
            return res.json({message: 'Please send your email and passowrd'})
        }
        if(!req.body.password ){
            return res.json({message: 'Please send your email and passowrd'})
        }

        if(!existingUser){
            return res.json({message: "Email or password does not match"})
        }


        //FIXME: agregar servicio para desacoplar
        if(existingUser){
            const matchedUser = existingUser.comparePassword(password)
            if(matchedUser){
                const token = existingUser.createToken()
                return res.json({existingUser, token})
            }
                      
        }
        return res.json({message: "Error Permission Denied"})


    } catch (error) {
        httpError(error)
    }

}








const signUpWithEmailPassword = async(req, res) =>{
    const {email, password} = req.body;
   

    const existingUser = await getUserByEmail(email);

    try {
        if(existingUser){
            return res.json({message: 'User with email already exists!'})
        }
    
        const newUser = {
            email: email,
            password: password
        }
        const savedUser = await addNewUser(newUser)

        if(savedUser){
            return res.json({message: 'user created'})
        }
            return res.json({message: 'error user not created'})
        
    } catch (error) {
        httpError(res, error)
    }

}









const updateItem = (req, res) => {

}

const deleteItem = (req, res) => {

}

module.exports = {
    getItem,
    signUpWithEmailPassword,
    signInWithEmailPassword,
    getItems,
    createItem,
    updateItem,
    deleteItem,
    validateEmail,
    validateLogin
}





