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
    provider_name:{ 
        type:String,
        default:"",
        index:true
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
        default: Date.now // Set default value to current date/time
    },
    updatedAt: {
		type: Date
	},
}
module.exports = mongoose.model('whatsapp_template', new Schema(smsSchema, { strict: false} ));