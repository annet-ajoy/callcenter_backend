const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

// Subdocument schema for each alternate email
const alternateEmailEntrySchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    }
  },
  { _id: true } 
);

// Main schema for customer alternate emails
const customerAlternateEmailSchema = new Schema(
  {
    customer_id: {
      type: Types.ObjectId,
      required: true,
      index: true,
      ref: "autoX_customField"
    },
    emails: [alternateEmailEntrySchema] 
  },
  { timestamps: true }
);

module.exports = mongoose.model("autoX_customer_alternative_email", customerAlternateEmailSchema);