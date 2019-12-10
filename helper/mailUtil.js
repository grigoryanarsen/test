const nodemailer = require('nodemailer');

const mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL || 'youremail@gmail.com',
        pass: process.env.EMAILPASS || 'yourpassword',
    }
});

module.exports = {
    mailer,
};