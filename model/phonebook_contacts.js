const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
var decreasedTime = currentDate.getTime() ;
let ObjectId = require('mongodb').ObjectId;

const phonebookSchema ={
    // name: {
    //     type: String,
    //     default: ""
    // },
     phone_number: {
        type: String,
        default: "",
        index: true
    },
    id_user: {
        type: Number,
        required: true,
        index: true
    },
    template_id : {
        type: ObjectId,
        default: "",
        index: true
    },
    id_department: {
        type: Number,
        required: true,
        index: true
    },
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
    createdAt: {
		type: Date,
		default: decreasedTime
	},
    updatedAt: {
		type: Date
	},
}
module.exports = mongoose.model('phonebook_contacts', new Schema(phonebookSchema, { strict: false} ));