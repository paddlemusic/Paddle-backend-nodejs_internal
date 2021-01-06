require('dotenv').config()
const passport = require('passport')
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
const FacebookTokenStrategy = require('passport-facebook-token')
// const FacebookStrategy = require('passport-facebook').Strategy
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const GoogleTokenStrategy = require('passport-google-token').Strategy
const config = require('../config/index')
const { OAuth2Client } = require('google-auth-library')
const googleClient = new OAuth2Client(config.GOOGLE.clientId)




passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

exports.getToken = function (user) {
  return jwt.sign(user, config.JWT.secret, {
    expiresIn: 3600
  })
}

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = config.JWT.secret

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
  clientID: config.FACEBOOK.clientId,
  clientSecret: config.FACEBOOK.clientSecret
}, (accessToken, refreshToken, profile, done) => {
  if (profile.id) {
    console.log('Facebook acessToken:', accessToken)
    return done(null, profile)
  }
}
))
// exports.facebookPassport = passport.use(new FacebookStrategy({
//   clientID: config.FACEBOOK.clientId,
//   clientSecret: config.FACEBOOK.clientSecret,
//   callbackURL: config.FACEBOOK.callbackURL // http://localhost:8080/paddle/api/v1/user/auth/google/callback
// }, (accessToken, refreshToken, profile, done) => {
//   if (profile.id) {
//     return done(null, profile)
//   }
// }
// ))

// exports.googlePassport = passport.use(new GoogleStrategy({
//   clientID: config.GOOGLE.clientId,
//   clientSecret: config.GOOGLE.clientSecret,
//   callbackURL: config.GOOGLE.callbackURL // http://localhost:8080/paddle/api/v1/user/auth/google/callback
// },
// function (accessToken, refreshToken, profile, done) {
//   if (profile.id) {
//     console.log('acessToken:', accessToken)
//     return done(null, profile)
//   }
// }
// ))
// exports.googlePassport = passport.use(new GoogleTokenStrategy({
//   clientID: config.GOOGLE.clientId,
//   clientSecret: config.GOOGLE.clientSecret
// }, (accessToken, refreshToken, profile, done) => {
//   if (profile.id) {
//     console.log('acessToken:', accessToken)
//     return done(null, profile)
//   }
// }
// ))


 exports.googleSignIn = function(req, res, next){
   console.log("Body is:", req.body.token)
    return googleClient
    .verifyIdToken({
      idToken: req.body.token,
      audience: config.GOOGLE.clientId
    })
    .then(login => {
      //if verification is ok, google returns a jwt
      var payload = login.getPayload();
      console.log("Payload is:", payload);
      var userid = payload['sub'];

      //check if the jwt is issued for our client
      var audience = payload.aud;
      if (audience !== config.GOOGLE.clientId) {
        throw new Error(
          'error while authenticating google user: audience mismatch: wanted [' +
          config.GOOGLE.clientId +
            '] but was [' +
            audience +
            ']'
        );
      }
      //promise the creation of a user
      return {
        displayName: payload['name'], //profile name
        pic: payload['picture'], //profile pic
        id: payload['sub'], //google id
        email_verified: payload['email_verified'],
        emails:[{value: payload['email']}]
      };
    })
    .then(user => {
      req.user = user;
      next()
      // return user;
    })
    .catch(err => {
      //throw an error if something gos wrong
      throw new Error(
        'error while authenticating google user: ' + JSON.stringify(err)
      );
    });
  }

