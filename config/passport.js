let JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
let config =  require('../config');
let catchDone;

const newStrategy = function (passport) {
    try {
        let opts = {};
        opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('Custom');
        opts.secretOrKey = config.AUTHORIZATION_TOKEN_SECRET;
        passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
            catchDone = done;
            if(jwt_payload) return done(null, true);
            return done(null, false);
        }));
    } catch (err) {
        return catchDone(null, false);
    }
};

module.exports = {
    newStrategy,
};
