const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
var decreasedTime = currentDate.getTime() ;
let ObjectId = require('mongodb').ObjectId;

const contactsSchema ={
    name: {
        type: String,
        default: ""
    },
     phone_number: {
        type: Array,
        default: "",
        required: true
    },
    id_user: {
        type: Number,
        required: true
    },
    id_department: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: decreasedTime
    },
    updatedAt: {
        type: Date
    },
}
module.exports = mongoose.model('contacts', new Schema(contactsSchema, { strict: false} ));