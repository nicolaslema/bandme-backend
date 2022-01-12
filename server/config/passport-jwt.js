const passport = require('passport')
const passportJwt = require('passport-jwt');
const userModel = require('../app/models/user.model');
const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;
const {getOneUser} = require('../app/services/user.service')


passport.use(
    new StrategyJwt(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
    async(payload, done) => {
        console.log('here')
        try {
            const user = await userModel.findOne(payload.id)
            if(user){
                return done(null, user)
            }
            return done(null, false)
        } catch (error) {
            console.log(error)
            return done(error)
            
        }
    }
))
