require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const {connectDB} = require('./config/db');
const passport = require('passport')
const session = require('express-session')


// Passport config
//GOOGLE , FACEBOOK, JWT
require('./config/passport-google')(passport)



const app  = express()

const PORT = process.env.PORT || 5000


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('dev'))
app.use(cookieParser())

app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      
    })
  )

app.use(passport.initialize())
app.use(passport.session())

app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})


app.use('/api/1.0' ,require('./app/routes'))

connectDB()
app.listen(PORT, ()=>{
    console.log('API lista, PORT', PORT)
})

