const mongoose = require('mongoose');
const { DATE } = require('sequelize');
let ObjectId = require('mongodb').ObjectId;
var Schema = mongoose.Schema;
const smsSchema ={
    template_id : {
        type: String,
        default: "",
        index: true
    },
    sender_id:{ 
        type:String,
        default:"",
        index:true
    },
    name:{ 
        type:String,
        default:"",
        index:true
    },
    message:{ 
        type:String,
        default:"",
        index:true
    },
    provider: {
         type: String, default: 'Voxbay'
        },
    id_user:{
        type:Number,
        default:"",
        index:true
    },
    id_department:{
        type:Number,
        default:"",
        index:true
    },
    createdAt: {
		type: Date,
		default:"",
	},
    updatedAt: {
		type: Date
	},
}
module.exports = mongoose.model('sms_setting_field', new Schema(smsSchema, { strict: false} ));

