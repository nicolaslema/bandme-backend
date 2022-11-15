const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const helmet = require("helmet");
const {connectDB} = require('./db');
const passport = require('passport');
const rootPath = process.env.ROOT_PATH;
const path = require('path');

class Server{

    constructor(){
        this.app = express();
        this.port = process.env.PORT || 5002;
        this.rootPath = rootPath;
        this.initMiddlewares();
        this.routes();
        connectDB();
        
    }

    initMiddlewares(){
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use(helmet());
        this.app.use('/uploads', express.static('uploads'));
        this.app.use(express.urlencoded({extended: true}))
        this.app.use(morgan('dev'))
        this.app.use(cookieParser())
        this.app.use(passport.initialize())
    }

    routes(){
        //Middware que se carga cuando pasa una solicitud por esta ruta. Para utilizar las request que estan dentro de Routes
        this.app.use(this.rootPath, require(path.join(process.cwd(), 'app' ,'api', 'routes', 'auth.routes')));//('../api/routes/auth.routes'));
        //this.app.use(otroPath, require('../api/routes/login.routes'));
    }

    listen(){
        this.app.listen(this.port, () => {
            console.log('Servidor is running on port: '+ this.port)
        });
    }
}

module.exports = Server;