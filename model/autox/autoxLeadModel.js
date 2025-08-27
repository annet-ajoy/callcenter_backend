const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
let decreasedTime = currentDate.getTime();
let timeToAdd = (5 * 60 + 30) * 60 * 1000;
let NormalizedTime=decreasedTime+timeToAdd
const customSchema ={
    id_user: {
        type: Number,
        required: true
    },
    user_id: {
        type: Number,
         //required: true
    }, 
    id_template: {
        type: String,
        required: true
    }, dtmfName: {
        type: String,
        default: ""
    }, dtmfNo: {
        type: Number,
        default: ""
    },
    createdAt: {
        type: Date,
        default:NormalizedTime,
    },
    updatedAt: {
        type: Date
    },
}
module.exports = mongoose.model('autoX_leadField', new Schema(customSchema, { strict: false} ));
// module.exports = mongoose.model('customField', customSchema);