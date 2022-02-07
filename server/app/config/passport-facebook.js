const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');

//facebookToken is the custom name of facebookstrategy
//FACEBOOK_APP_ID and FAEBOOK_APP_SECRET are set in .env file
passport.use(
    new FacebookTokenStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FAEBOOK_APP_SECRET,
      },
      async (accessToken, refreshToken, profile, done, res) => {
        //console.log(`profile email: ${profile.emails[0].value}////token: ${accessToken}////PROFILE:  ${JSON.stringify(profile)}`);
      
        console.log('primer nombre: ' + profile.name.givenName);

        const user = {
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            profilePhoto: profile.photos[0].value,
            email: profile.emails[0].value,
            provider: "FACEBOOK"
        }
        console.log("usuario obtenido de facebook: "+ JSON.stringify(user));
        done(null, user);

        /* const newuser = {
            email: profile.emails[0].value,
            facebookid: profile.id !== null ? profile.id : null,
            token: accessToken
          };
          done(null, newuser); */
  
        //check if there is a existing user in database either
        //with the user email or corresponding facebookid
        /* const existingUser = await models.user.findOne({
          where: {
            [Sequelize.Op.or]: [
              { email: { [Sequelize.Op.eq]: profile.emails[0].value } },
              { facebookid: { [Sequelize.Op.eq]: profile.id } },
            ],
          },
          attributes: ['id', 'email', 'facebookid'],
        }); */
        //if user exists, then return the existing user
        /* if (existingUser) {
          return done(null, existingUser);
        }
   */
        //if user does not exist, then create a new record in database
        //with user email and facebookid.
        /* const newuser = await models.user.create({
          email: profile.emails[0].value,
          facebookid: profile.id !== null ? profile.id : null,
        }); */
  
        /* if (typeof newuser !== 'undefined' && newuser !== null) {
           console.log(`record inserted successfully`);
          done(null, newuser);
        } */
      }
    )
  );