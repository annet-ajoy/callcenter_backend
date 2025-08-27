const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;
var currentDate = new Date();
let decreasedTime = currentDate.getTime();
var Schema = mongoose.Schema;
const smsSettingSchema = {
    type: {
        type: String,
        default: "",
        index: true
    },
    status_id: {
        type: String,
        default: "",
        index: true
    },
    sms_template_id: {
        type: String,
        default: "",
        index: true
    },
    template_id: {
        type: ObjectId,
        default: "",
        index: true
    },
    sending_type: {
        type: String,
        default: "",
        index: true
    },
    createdAt: {
        type: Date,
        default: decreasedTime
    },
    updatedAt: {
        type: Date
    },
}
module.exports = mongoose.model('sms_field', new Schema(smsSettingSchema, { strict: false }));