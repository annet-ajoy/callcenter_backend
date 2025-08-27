const mongoose = require("mongoose");
const { Schema } = mongoose;

const ticketStatusSchema = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["open", "close", "onhold", "in-progress", "reopened"],
      required: true,
      index: true,
    },
    // Time allotted in minutes
    timeAllotted: {
      type: Number,
    },
    color: {
      type: String,
    },
    closePermissions: {
      type: [
        {
          _id: false,
          type: {
            type: String,
            enum: ["ticket_creator", "ticket_assignee", "associated_department", "admin", "agent", "department", "subadmin", "customer"],
            required: true,
          },
          id: { type: Number, required: true },
          displayName: {
            type: String,
            required: true,
          },
        },
      ],
      default: undefined,
    },
    closePermissionRequired: { type: Boolean },
  },
  {
    timestamps: false,
  }
);


module.exports = mongoose.model("autox_ticket_status", ticketStatusSchema);
