const auth = require('../controllers/authController');
const passport = require('passport');
// require('../../config/passport')(passport);
const { newStrategy } = require('../../config/passport');
newStrategy(passport);

module.exports = function (app) {
    // Authenticator route
    app.use('/auth', passport.authenticate('jwt', { session: false }), auth.authenticate)
};
