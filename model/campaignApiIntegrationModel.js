const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
var decreasedTime = currentDate.getTime() ;
let ObjectId = require('mongodb').ObjectId;

const apiIntegrationValueSchema ={
    campaign_id : {
        type: Number,
        default: "",
        index: true
    }
}
module.exports = mongoose.model('campaign_api_integration', new Schema(apiIntegrationValueSchema, { strict: false} ));