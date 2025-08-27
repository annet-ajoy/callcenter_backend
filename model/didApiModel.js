const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const didApiSchema = new Schema({
  _id: { type: String, required: true },
  id_user: { type: String, required: true },

  outgoingApi: {
    template_id: { type: ObjectId, ref: "api_integration" },
    body_values: { type: String },
    platform: {
      type: String,
      enum: ["zoho", "lead_square", "none"],
      default: "none"
    }
  },

  incomingApi: {
    template_id: { type: ObjectId, ref: "api_integration" },
    body_values: { type: String },
    platform: {
      type: String,
      enum: ["zoho", "lead_square", "none"],
      default: "none"
    }
  }

}, { timestamps: true });

module.exports = mongoose.model('did_apis', didApiSchema);
