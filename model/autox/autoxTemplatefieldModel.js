const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;
var currentDate = new Date();
let decreasedTime = currentDate.getTime() ;
var Schema = mongoose.Schema;
const phonebookSchema ={
    template_id : {
        type: ObjectId,
        default: "",
        index: true
    },
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
    field_name:{
        type: Object,
        default: ""
    },
    field_type: {
        type: String,
        default: ""
    },
    field_order: {
        type: Number,
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
module.exports = mongoose.model('autoX_template_field', new Schema(phonebookSchema, { strict: false} ));