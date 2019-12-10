const config = require('../config');
const db = require('../api/models');
const { users: userModel } = db;
const path = require('path');
const  fs = require('fs');
const handlebars = require('handlebars');

const pdf = require('html-pdf');


class ExporterClass {
    constructor () {
        this.exportUserDataPDF = this.exportUserDataPDF.bind(this);
        this.pdf = pdf;
        this.options = {
            format: 'A4'
        };
        this.models = { userModel };
    }

    async doWrapped(data, user) {
        return new Promise((resolve, reject) => {
            this.pdf.create(data, this.options).toFile(`./docs/user/${user.username}_Data.pdf`, function(err, res) {
                if(err) reject(err);
                if(res) resolve(res);
            });
        });
    }

    async exportUserDataPDF(req, res) {
        try {
            console.log('exportPDF');

            const { id } = req.params;
            if(!id) return res.status(400).send({ success: false, msg: 'Please pass User ID' });
            const user = await this.models.userModel.findOne({
                where: { id },
                raw: true,
            });

            if(!user) return res.status(400).send({ success: false, msg: 'Cant Find User With Provided ID' });

            const template = fs.readFileSync(path.resolve(path + '../../docs/templates/userTemplate.html'), 'utf8');
            const userTemplate = handlebars.compile(template);
            const result = userTemplate(user);
            const data = await this.doWrapped(result, user);

            return res.download(data.filename, 'UserData.pdf');
        } catch (err) {
            console.log(err);
            return res.status(409).send({ success: false, msg: 'Something went wrong' })
        }
    }

}

module.exports = new ExporterClass();