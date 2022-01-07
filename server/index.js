require('dotenv').config()
const express = require('express')
const cors = require('cors')

const morgan = require('morgan')
const {connectDB} = require('./config/db');






const app  = express()

const PORT = process.env.PORT || 5000


app.use(cors())
app.use(express.json())
app.use(morgan('dev'))



connectDB()
app.listen(PORT, ()=>{
    console.log('API lista, PORT', PORT)
})

