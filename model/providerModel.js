const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;
var currentDate = new Date();
let decreasedTime = currentDate.getTime() ;
var Schema = mongoose.Schema;
const providerSchema ={
    provider_name: { type: String, required: true },
}
module.exports = mongoose.model('provider_collections', new Schema(providerSchema, { strict: false} ));