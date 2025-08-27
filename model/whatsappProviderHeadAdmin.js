const mongoose = require('mongoose');
const { DATE } = require('sequelize');
let ObjectId = require('mongodb').ObjectId;
var Schema = mongoose.Schema;
const smsSchema ={
    whatsapp_id : {
        type: ObjectId,
        default: "",
        required:true,
        index: true
    }
}
module.exports = mongoose.model('whatsapp_templates_head', new Schema(smsSchema, { strict: false} ));