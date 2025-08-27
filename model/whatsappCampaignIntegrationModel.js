const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
var decreasedTime = currentDate.getTime() ;
let ObjectId = require('mongodb').ObjectId;

const jwtvalueSchema ={
    campaign_id : {
        type: Number,
        default: "",
        index: true
    }
}
module.exports = mongoose.model('whatsapp_campaign_integration', new Schema(jwtvalueSchema, { strict: false} ));