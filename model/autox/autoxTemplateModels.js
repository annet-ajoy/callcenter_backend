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
    name:{
        type: String,
        default: ""
    },
    description:{
        type: String,
        default: ""
    },
    save_data_to: {
        type: Number,
        default: ""
    },
    included_staffs: {
        type: Array,
        default: ""
    },
    createdAt: {
        type: Date,
        default: decreasedTime
    },
    updatedAt: {
        type: Date
    },
}
module.exports = mongoose.model('autoX_template_collections', new Schema(phonebookSchema, { strict: false} ));