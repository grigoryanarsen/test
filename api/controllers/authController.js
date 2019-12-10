const jwt = require('jsonwebtoken');

const config = require('../../config');
const db = require('../models');
const { users: userModel } = db;

class AuthControllerClass {
    constructor() {
        this.authenticate = this.authenticate.bind(this);
        this.models = { userModel };
    }

    async authenticate(req, res, next) {
        try {
            console.log('authenticate');
            let token = await AuthControllerClass.getToken(req.headers);
            if (!token) {
                res.status(204).json({success: false, msg: "unAuthorized"});
                next();
            }
            const verified = jwt.verify(token, config.AUTHORIZATION_TOKEN_SECRET);

            if(!verified) return res.status(401).send({ success: false, msg: 'Cant Verify Token' }); // Maybe Unreachable case
            const { username, id } = verified;

            const user = await this.models.userModel.findOne({
                where: { username, id },
                raw: true,
            });

            if(!user) return res.status(401).send({ success: false, msg: 'Cant Find user' });
            res.locals.user = user;
            next();
        } catch (err) {
            console.log(err);
            return res.status(409).send({success: false, msg: 'Something went wrong'});
        }
    }

    static async getToken(headers) {
        if (!headers || !headers.authorization){
            return null ;
        }
        let parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        }
        return null;
    };
}

module.exports = new AuthControllerClass();
