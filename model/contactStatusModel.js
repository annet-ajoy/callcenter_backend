const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
var decreasedTime = currentDate.getTime() ;
let ObjectId = require('mongodb').ObjectId;

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
    phonebook_id : {
        type: String,
        default: "",
        index: true
    },
    campaignId : {
        type: Number,
        default: "",
        index: true
    },
    contactId : {
        type: ObjectId,
        ref: 'phonebook_contacts',
        index: true
    },
    status: {
        type: Number,
        default: 0,  // 0 = not contacted, 1 = contacted, 2 = not connected, 3 = connected, 4 = skip, 5 = busy, 6 = cancel, 7 = channel_unavailable, 8 = congestion, 9 = connection_inprogress 
        index: true
    },
    retryCount: {
        type: Number,
        default: 0,
        index: true
    },
    attempt: {
        type: Number,
        default: 0,
        index: true
    },
    duplicate: {
        type: Number,
        default:0,
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
module.exports = mongoose.model('contacts_status', new Schema(phonebookSchema, { strict: false} ));