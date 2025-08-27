const mongoose = require('mongoose');
const { DATE } = require('sequelize');
let ObjectId = require('mongodb').ObjectId;
var Schema = mongoose.Schema;
const smsSchema ={
    sms_table_id : {
        type: ObjectId,
        default: "",
        required:true,
        index: true
    }
}
module.exports = mongoose.model('sms_integration_body', new Schema(smsSchema, { strict: false} ));