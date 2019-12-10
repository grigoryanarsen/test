const config = require('../../config');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const { users: userModel } = db;
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync();
const { mailer } = require('../../helper');
const path = require('path');

class UserControllerClass {
    constructor(){
        // this.reset = this.reset.bind(this);
        this.signUp = this.signUp.bind(this);
        this.signIn = this.signIn.bind(this);
        this.validateTokenAndResetPass = this.validateTokenAndResetPass.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.models = { userModel };
        this.mailOptions = {
                from: process.env.EMAIL || 'youremail@gmail.com',
                to: '',
                subject: 'ResetPassword',
                text: '',
        }
    }

    async signUp(req, res) {
        try {
            console.log('signUp');
            const { username, password } = req.body;
            if (!username || !password) {
                return res.json({success: false, msg: 'Please pass username, passwords'});
            }
            if(password.length < 6) return res.status(403).send({ success: false, msg: "Password Should be minimum 6 characters" });

            await this.models.userModel.create({...req.body});
            return res.status(200).send({success: true, msg: 'Successful created new user.'});
        } catch (err) {
            console.log(err);
            return res.status(409).send({success: false, msg: 'Something went wrong'});
        }
    }

    async signIn(req, res) {
        console.log('signIn');
        try {
            // set username null in case if user want to login with email only
            const { username, password, email } = req.body;
            if(!email || !password) return res.status(409)
                .send({success: false, msg: 'Please Pass Username/Password'});

            const user = await this.models.userModel.findOne({
                where: { [Op.or]:[ { username }, { email } ] },
            });

            if(!user) return res.status(258).send({success: false, msg: 'User not found. '});

            const isValidPassword = await UserControllerClass.validatePassword(req.body.password, user);
            if(!isValidPassword) return res.status(409).send({success:false, msg: 'Wrong password'});
            const token = jwt.sign({username: user.username, id: user.id}, config.AUTHORIZATION_TOKEN_SECRET, {expiresIn: '1h'});
            return res.status(200).send({success: true, token: 'CUSTOM ' + token});
        } catch (err) {
            console.log(err);
            return res.status(409).send({success: false, msg: 'Something went wrong'});
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if(!email) return res.status(403).send({ success: false, msg: 'Please Send Email To Reset Password' });
            const userExist = this.models.userModel.findOne({ where: { email }, raw: true });

            if(!userExist) return res.status(409).send({ success: false, msg: 'User With Provided Email does not exist' });
            const token = jwt.sign({username: user.username, id: user.id}, config.RESETPASSWORD_TOKEN_SECRET, {expiresIn: '10m'});

            this.mailOptions.to = email;
            // note localhost Should be Replaced with Server Address, I did it For Local tests only
            this.mailOptions.text = `localhost:8080/forgotPassword/?token=${token}`;
            const result = mailer.sendMail(this.mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    return { success: true, msg: `Email sent to: ${info.response}`}
                }
            });
            console.log('result', result);
            return res.status(200).send({ success: true, msg: 'Password Reset link sent To You email' });
        } catch (err) {
            console.log(err);
            return res.status(409).send({ success: false, msg: 'Something went wrong' });
        }
    }

    async validateTokenAndResetPass(req, res) {
        try {
            return res.sendFile(path.resolve(path + '.. /../public/reset-password.html'))
        } catch (err) {
            console.log(err);
            return res.status(409).send({success: false, msg: 'Something went wrong'});
        }
    }

    async resetPassword(req, res) {
        try {
            console.log('resetPassword');
            const { newPassword, verifyPassword, token } = req.body;
            console.log('req.body', req.body);
            if(!newPassword || (newPassword !== verifyPassword)) {
                return res.status(409).send({ msg: 'Pass new Password to Reset' });
            }

            const verified = jwt.verify(token, config.RESETPASSWORD_TOKEN_SECRET);
            if(!verified || !token) return res.status(400).send({ success: false, msg: 'Invalid Token' });

            const hashedPassWord = bcrypt.hashSync(newPassword, salt);
            const user = await this.models.userModel.update({ password: hashedPassWord},{
                where: {
                    username: verified.username,
                    id: verified.id,
                }
            });
            return res.status(200).send({success: !!user, msg: !!user ? 'Successfully Changed' : 'Cant Reset Password'});
        } catch(err) {
            console.log(err);
            return res.status(409).send({success: false, msg: 'Something went wrong'});
        }
    }

    static async validatePassword(password, user) {
        console.log('validatePassword');
        return bcrypt.compareSync(password, user.password);
    }
}

module.exports = new UserControllerClass();
