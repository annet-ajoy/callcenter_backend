const mongoose = require('mongoose');
const { DATE } = require('sequelize');
let ObjectId = require('mongodb').ObjectId;
var Schema = mongoose.Schema;
const smsSchema ={
    id_user : {
        type: Number,
        default: "",
        index: true
    },
    time: {
		type: Date,
		default:"",
	},
    uniqueId: {
        type: String,
        required: false,
        index: true
    },
    userOrCaller:{ 
        type:Number,
        default:""
    },
    successOrfail:{ 
        type:String,
        default:"",
        index:true
    },
    user_id:{
        type:Number,
        default:"",
        index:true
    },
}
module.exports = mongoose.model('sms_report', new Schema(smsSchema, { strict: false} ));

