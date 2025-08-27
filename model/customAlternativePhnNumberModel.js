const mongoose = require('mongoose');
const { DATE } = require('sequelize');
let ObjectId = require('mongodb').ObjectId;
var Schema = mongoose.Schema;
const phoneNUmberSchema ={
    customer_id : {
        type: ObjectId,
        default: "",
        index: true
    },
    alternative_phone_number : {
        type: String,
        default: ""
    },
    alternative_name  : {
        type: String,
        default: ""
    }
}
module.exports = mongoose.model('customer_alternative_phone_number', new Schema(phoneNUmberSchema, { strict: false} ));