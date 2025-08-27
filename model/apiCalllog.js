const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;
var currentDate = new Date();
var decreasedTime = currentDate.getTime() ;
var Schema = mongoose.Schema;
const call_logSchema ={
    insertedTime: {
        type: Date,
        default: Date.now, // Sets the current timestamp when the document is created
    },
    actualTime: {
        type: Date,
        default: new Date('0000-00-00T00:00:00Z'), // Sets the default value to '0000-00-00 00:00:00'
    },
    type: {
        type: String,
        required: false,
    },
    userLevel: {
        type: String,
        required: false,
    },
    uniqueId: {
        type: String,
        required: false,
        index: true
    },
    callData: {
        type: String,
        required: false,
    }
}
module.exports = mongoose.model('api_call_log', new Schema(call_logSchema, { strict: false} ));