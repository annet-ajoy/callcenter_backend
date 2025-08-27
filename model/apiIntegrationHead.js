const mongoose = require('mongoose');
const { DATE } = require('sequelize');
let ObjectId = require('mongodb').ObjectId;
var Schema = mongoose.Schema;
const smsSchema ={
    api_table_id : {
        type: ObjectId,
        default: "",
        required:true,
        index: true
    }
}
module.exports = mongoose.model('api_integration_head', new Schema(smsSchema, { strict: false} ));