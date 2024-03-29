const passport = require('passport');
//const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleTokenStrategy = require("passport-google-verify-token").Strategy;
const passportJwt = require('passport-jwt');
const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;

//module.exports = function(passport){
module.exports = (passport) => {
    passport.use(

        new GoogleTokenStrategy({
            clientID: process.env.CLIENT_ID
        },
            function(parsedToken, googleId, done) {

                console.log('datos obtenidos de google ======> : ' + JSON.stringify(parsedToken));

            const user ={
                firstName: parsedToken.given_name,
                lastName: parsedToken.family_name,
                profilePhoto: parsedToken.picture,
                email: parsedToken.email,
                provider: "GOOGLE"
            }
            
            done(null, user);
            }
        )
    );

        passport.serializeUser(function(user, done) {
            done(null, user);
        });
    
        passport.deserializeUser(function(user, done) {
            done(null, user);
        });
}

