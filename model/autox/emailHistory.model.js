const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const emailHistorySchema = new Schema(
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
    subject: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "", 
    },
    sender: {
      id: {
        type: Number,
      },
      senderType: {
        type: String,
        enum: ["admin", "agent", "department", "subadmin"],
      },
    },
    attachments: [
      {
        url: {
          type: String,
          required: true,
        },
        localPath: {
          type: String,
          default: "",  
        },
        type: {
          type: String,
          enum: ["doc", "image", "msword"],
          required: true,
        },
      },
    ],
    emailUid: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.model("autox_email_history", emailHistorySchema);
