const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
let decreasedTime = currentDate.getTime() - (1.30 * 60 * 60 * 1000);
let createdAtDate = new Date(decreasedTime);
const customSchema ={
    id_user: {
        type: Number,
        required: true
    },
    user_id: {
        type: Number,
        // required: true
    },
    id_template: {
        type: String,
        required: true
    },dtmfName: {
        type: String,
        default: ""
    }, dtmfNo: {
        type: Number,
        default: ""
    },
    createdAt: {
        type: Date,
        default: ""
    },
    updatedAt: {
        type: Date
    },
}
module.exports = mongoose.model('autoX_customField', new Schema(customSchema, { strict: false} ));
// module.exports = mongoose.model('customField', customSchema);