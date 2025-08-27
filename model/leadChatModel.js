const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
var decreasedTime = currentDate.getTime() ;
let ObjectId = require('mongodb').ObjectId;

const leadchatSchema ={
    name: {
        type: String,
        required: true,
        index: true
    },
    agent_id: {
        type: Number,
        required: true,
        index: true
    },
    agentName : {
        type: String,
        default: ""
    },
    createdAt: {
		type: Date,
		default: ""
	},
    description : {
        type: String,
       default: ""
    },
    customer_name : {
        type: String,
       default: ""
    },
    lead_id : {
        type: String,
       default: ""
    },
    image : {
        type: String,
       default: ""
    },
}
module.exports = mongoose.model('lead_chat', new Schema(leadchatSchema, { strict: false} ));