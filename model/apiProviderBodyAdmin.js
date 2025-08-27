const mongoose = require('mongoose');
const { DATE } = require('sequelize');
let ObjectId = require('mongodb').ObjectId;
var Schema = mongoose.Schema;
const smsSchema ={
    api_id : {
        type: ObjectId,
        default: "",
        required:true,
        index: true
    }
}
module.exports = mongoose.model('api_templates_body', new Schema(smsSchema, { strict: false} ));