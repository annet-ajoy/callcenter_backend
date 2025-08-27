const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
let ObjectId = require('mongodb').ObjectId;
var decreasedTime = currentDate.getTime() ;
const phonebookSchema ={
    name: {
        type: String,
        default: ""
    }, 
    phonebook_id : {
        type: String,
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
    createdAt: {
		type: Date,
		default: decreasedTime
	},
    updatedAt: {
		type: Date
	},
}
module.exports = mongoose.model('phonebook_collections', new Schema(phonebookSchema, { strict: false} ));