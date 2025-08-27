const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const deliveryTargetSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["ticket_creator", "ticket_assignee", "associated_department", "admin", "agent", "customer", "department", "subadmin", "other"],
      required: true,
    },
    templateId: {
      type: Types.ObjectId,
    },
    displayName: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
    }
  },
  { _id: false }
);

const actionSchema = new Schema(
  {
    templateType: {
      type: String,
      enum: ["whatsapp", "sms", "api", "link", "email", "call", "otp"],
      required: true,
    },
    deliveryTargets: {
      type: [deliveryTargetSchema],
      required: true,
      default: [],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const ticketSettingSchema = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    statusId: {
      type: Types.ObjectId,
      index: true,
    },
    actionType: {
      type: String,
      enum: ["triggerAction", "timeout", "assign", "closing", "dueDateAction"],
      required: true,
      index: true,
    },
    actions: {
      type: [actionSchema],
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("autox_ticket_settings", ticketSettingSchema);
