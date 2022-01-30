const passport = require('passport');
const userModel = require('../app/models/user.model');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {getUserByEmail,  addNewUser} = require('../app/services/user.service')
const passportJwt = require('passport-jwt')
const ExtractJwt = passportJwt.ExtractJwt
const StrategyJwt = passportJwt.Strategy




module.exports = function(passport){


passport.use(

    new GoogleStrategy({
        callbackURL: process.env.CALLBACK_URL,
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    },
        async (accessToken, refreshToken, profile, done) =>{
           const currentNewGoogleUser ={
               id: profile.id,
               displayName: profile.displayName,
               firstName: profile.name.givenName,
               lastName: profile.name.familyName,
               profilePhoto: profile.photos[0].value,
               email: profile.emails[0].value,
               source: "google"
           }


           //TODO: ADD SERVICES TO REGISTER AND LOGIN WITH TOKEN

           try {
               const user = await userModel.findOne({email: profile.emails[0].value})
               if(user){
                   done(null, user)
               }else{
                const newUser = await addNewUser(currentNewGoogleUser)
                done(null, user)
               }

               if(user.source != "google"){
                return done(null, false, { message: `You have previously signed up with a different signin method` });
               }
            
           } catch (error) {
                           
           }

        }
    )
)




passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    const currentUser = await userModel.findOne({ id });
    done(null, currentUser);
  })
}