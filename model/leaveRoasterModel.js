const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;
var currentDate = new Date();
var Schema = mongoose.Schema;
const leaveRosterSchema = {
    id_user: {
        type: Number,
        require:true,
        index: true
    },
    id_department: {
        type: Number,
         require:true,
        index: true
    },
    user_id: {
        type: Number,
    },
     status: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: currentDate
    },
    updatedAt: {
        type: Date
    },
}

module.exports = mongoose.model('leaveRoaster', new Schema(leaveRosterSchema, { strict: false }));