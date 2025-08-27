const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
let decreasedTime = currentDate.getTime() - (1.30 * 60 * 60 * 1000);
let createdAtDate = new Date(decreasedTime);
const customSchema ={
    ticket_id: {
        type: String,
        required: true
    },
    array: {
        type: Array, // Array of strings
        default: []
    },
    createdAt: {
        type: Date,
        default: ""
    },
    updatedAt: {
        type: Date
    },
}
module.exports = mongoose.model('autoX_ticketToDoAction', new Schema(customSchema, { strict: false} ));