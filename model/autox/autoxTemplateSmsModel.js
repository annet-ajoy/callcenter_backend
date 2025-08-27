const mongoose = require('mongoose');
var Schema = mongoose.Schema;
let ObjectId = require('mongodb').ObjectId;

const customSchema ={
    templateId: {
        type:String,
    },
}
module.exports = mongoose.model('autoX_template_sms', new Schema(customSchema, { strict: false} ));