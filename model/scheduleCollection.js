const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currentDate = new Date();
var decreasedTime = currentDate.getTime() ;
let ObjectId = require('mongodb').ObjectId;
const phonebookSchema ={
    scheduleNo: {
        type: String,
        default: ""
    }, 
    collectionId : {
        type: ObjectId,
        default: "",
    }
}
module.exports = mongoose.model('schedule_collection', new Schema(phonebookSchema, { strict: false} ));