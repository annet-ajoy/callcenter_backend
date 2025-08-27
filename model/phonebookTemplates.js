const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;
var currentDate = new Date();
var decreasedTime = currentDate.getTime() ;
var Schema = mongoose.Schema;
const phonebookSchema ={
    phonebook_id : {
        type: String,
        default: "",
        index: true
    },
    collectionId : {
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
    createdAt: {
		type: Date,
		default: decreasedTime
	},
    updatedAt: {
		type: Date
	},
}
module.exports = mongoose.model('phonebook_templates', new Schema(phonebookSchema, { strict: false} ));