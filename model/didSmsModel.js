const mongoose = require('mongoose');
const { DATE } = require('sequelize');
let ObjectId = require('mongodb').ObjectId;
var Schema = mongoose.Schema;
const smsSchema ={
    did_id : {type: Number,required:true},
    integration_template_id : {type: ObjectId,required:true},
    sms_repeat_count : {type: Number},
    repeat_interval : {type: Number}, // 0 = day , 1 = weakly , 2 = monthly
    call_status : {type: Number,required:true}, // 0 = answered , 1 = failed
    call_type : {type: Number,required:true}, // 0 = incoming , 1 = outgoing
    sending_type : {type: Number,required:true}, // 0 = caller , 1 = user
    send_to : {type: Number}, // 0 = first_tried_user , 1 = last_tried_user , 2 = phn_number
    send_to_phn_number : {type: Number},
    sending_parameters : {type: String},
    enable_whatsapp_limit: { type: Boolean },
    flag:{type:Number}
}
module.exports = mongoose.model('did_sms', new Schema(smsSchema, { strict: false} ));