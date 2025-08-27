const mongoose = require('mongoose');
var Schema = mongoose.Schema;
let ObjectId = require('mongodb').ObjectId;

const customSchema ={
    smsToUser: {
        type:String,
    },
}
module.exports = mongoose.model('autoX_template_api', new Schema(customSchema, { strict: false} ));