const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const smsSchema ={
  campaignId: { type: Number, required: true },
  // method: { type: String, required: false },
  // whatsapp_provider_name: { type: String, required: false },
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
module.exports = mongoose.model('broadcast_whatsapp_integration', new Schema(smsSchema, { strict: false} ));