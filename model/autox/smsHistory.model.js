const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const smsHistorySchema = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    customer_id: {
      type: Types.ObjectId,
      ref: "call_task_contacts",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      id: {
        type: Number,
        required: true,
      },
      senderType: {
        type: String,
        enum: ["admin", "agent", "customer", "department", "subadmin"],
        required: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("autox_sms_history", smsHistorySchema);
