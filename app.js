const express = require('express');
const db = require("./api/models");
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');

//--! import Routes !--//
const authRouter = require('./api/routes/authRouter');
const userRouter = require('./api/routes/userRouter'); //importing route

db.models.sync();
// create a write stream for logger
app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.set('views', path.join(__dirname, 'views'));

//-- assign routes To app --//
authRouter(app);
userRouter(app);

//error handlers
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (req, res, next) {
    try {
        next();
    } catch (err) {
        console.log('Error handler', err);
        res.status( err.statusCode || err.status || 500).send({error: err.message || err});
    }
});

app.listen(8080, () => console.log("App listening on port 8080!"));

module.exports = app;
