const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
var decreasedTime = currentDate.getTime() ;
let ObjectId = require('mongodb').ObjectId;

const whatsappSchema ={
    whatsapp_url: {
        type: String,
        required: true,
        index: true
    },
    name : {
        type: String,
        required: true,
        index: true
    },
    phone_no: {
        type: String,
        required: true,
        index: true
    }
}
module.exports = mongoose.model('whatsapp_settings', new Schema(whatsappSchema, { strict: false} ));