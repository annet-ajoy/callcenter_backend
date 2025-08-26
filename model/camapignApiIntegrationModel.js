const mongoose = require('mongoose');
var Schema = mongoose.Schema;
let ObjectId = require('mongodb').ObjectId;
var currentDate = new Date();
let decreasedTime = currentDate.getTime() ;

const smsSchema ={
    id_user:{
        type:Number,
        default:"",
    },
    id_department:{
        type:Number,
        default:0,
    },
    campaign_id : {
        type: Number,
        default: "",
    },
    template_sms_id : {
        type: String,
        default: "",
    },
    sms_variable : {
        type: Array,
        default: "",
    },
    createdAt: {
        type: Date,
        default: decreasedTime,
    }
}
module.exports = mongoose.model('camapign_apiIntegration_collections', new Schema(smsSchema, { strict: false} ));