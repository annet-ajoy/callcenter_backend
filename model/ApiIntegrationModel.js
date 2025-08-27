const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const smsSchema ={
   method: { type: String, required: false },
  api_provider_name: { type: String, required: false },
  type: { type: String, required: false },
  url: { type: String, required: false },
  dynamic: { type: Boolean, required: false },
  callflow_enabled: {type: String, required: false },
   createdAt: {
    type: Date,
    default: Date.now,
},
    updatedAt: {
		type: Date
	},
}
module.exports = mongoose.model('api_integration', new Schema(smsSchema, { strict: false} ));