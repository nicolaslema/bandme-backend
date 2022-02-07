const Server = require('./app/config/server');

const server = new Server();
server.listen();
/* require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const {connectDB} = require('./config/db');
const passport = require('passport')
const session = require('express-session')

//Passport config
//JWT 
const JWTSTrategy = require('./config/passport-jwt')

//Passport config
//GOOGLE 
require('./config/passport-google')(passport)


//Passport config
//FACEBOOK 




const app  = express()

const PORT = process.env.PORT || 5000


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('dev'))
app.use(cookieParser())


//@desc solamente para el front en react.
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

//@desc ruta inicial
//@route USE /api/1.0/
app.use('/api/1.0' ,require('./app/api/routes'))

connectDB()
app.listen(PORT, ()=>{
    console.log('API lista, PORT', PORT)
})

 */