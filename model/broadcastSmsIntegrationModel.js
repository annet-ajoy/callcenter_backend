const mongoose = require('mongoose');
const { INTEGER } = require('sequelize');
var Schema = mongoose.Schema;

const smsSchema ={
  campaignId: { type: Number, required: true },
  // sms_provider_name: { type: String, required: false },
  // type: { type: String, required: false },
  // url: { type: String, required: false },
  // dynamic: { type: Boolean, required: false },
  // message: { type: String, required: false },
  // callflow_enabled:{type: String, required: false},
  createdAt: {
    type: Date,
    default: Date.now,
},

    updatedAt: {
		type: Date
	},
}
module.exports = mongoose.model('broadcast_sms_integration', new Schema(smsSchema, { strict: false} ));