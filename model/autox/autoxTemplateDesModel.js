const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;
var currentDate = new Date();
let decreasedTime = currentDate.getTime() ;
var Schema = mongoose.Schema;
const phonebookSchema ={
    id_user: {
        type: Number,
        required: true,
        index: true
    },
    id_department: {
        type: Number,
        required: true,
        index: true
    },
    callUniqueId:{
        type: String,
        default: ""
    },
    description:{
        type: String,
        default: ""
    },
    insert_data_id: {
        type: ObjectId,
    },
    user_id: {
        type: Number,
        default: ""
    },
    createdAt: {
        type: Date,
        default: decreasedTime
    }
}
module.exports = mongoose.model('template_dec_collections', new Schema(phonebookSchema, { strict: false} ));