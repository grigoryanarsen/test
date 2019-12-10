const userCtrl = require('../controllers/usersController');
const exporter  = require('../../helper/exporter');
module.exports = function (app) {
    app.route('/signup')
        .post(userCtrl.signUp);

    // User Routes to signIn
    app.route('/signin')
        .post(userCtrl.signIn);

    app.route('/forgotPassword')
        .post(userCtrl.forgotPassword)
        .get(userCtrl.validateTokenAndResetPass);

    app.route('/reset')
    .post(userCtrl.resetPassword);

    app.route('/auth/download/user/:id')
        .post(exporter.exportUserDataPDF);
};
