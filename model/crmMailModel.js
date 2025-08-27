const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
var decreasedTime = currentDate.getTime() ;
let ObjectId = require('mongodb').ObjectId;

const crmMailSchema ={
    from_mail: {
        type: String,
        required: true,
        index: true
    },
    app_password : {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        index: true
    }
}
module.exports = mongoose.model('crm_mail', new Schema(crmMailSchema, { strict: false} ));