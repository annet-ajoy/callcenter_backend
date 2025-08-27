const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;
var Schema = mongoose.Schema;
const callTaskSchema = new Schema(
    {
        call_task_id: {
            type: ObjectId,
            ref: "call_task",
            index: true
        },
        contact_id: {
            type: ObjectId,
            ref: "call_task_contacts",
            index: true
        },
        comment: {
            type: String,
            required: true,
        },
        role: {
            type: Number,
            required: true, // 1 = admin , 2 = subadmin, 3 = user, 4 = department
        },
        sender_id: {
            type: Number
        },
        unique_id: {
            type: String
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model('call_task_comment', new Schema(callTaskSchema, { strict: false }));