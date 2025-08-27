const mongoose = require('mongoose');
var Schema = mongoose.Schema;
let ObjectId = require('mongodb').ObjectId;
var currentDate = new Date();
let decreasedTime = currentDate.getTime() - (1.30 * 60 * 60 * 1000);
let createdAtDate = new Date(decreasedTime);
const dataformSchema ={
    id_user: {
        type: Number,
        required: true
    },
    id_department: {
        type: Number,
        required: true
    },
    dataform_id: {
        type: ObjectId,
    },
    callTask_id:{
        type: ObjectId,
    }
}
module.exports = mongoose.model('autoX_default_calltask_for_dataform', new Schema(dataformSchema, { strict: false} ));