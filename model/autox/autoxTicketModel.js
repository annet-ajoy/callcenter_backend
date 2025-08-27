const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const customSchema = {
  id_user: {
    type: Number,
    required: true,
  },
  id_department: {
    type: Number,
    default: 0,
  },
  // user_id can be id of user(agent) or department
  user_id: {
    type: Number,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "customField"
  },
  assignedToRole: {
    type: String,
    enum: ["agent", "department"],
    default: "agent",
  },
  id_template: {
    type: String,
    // required: true,
    default: ""
  },
  dtmfName: {
    type: String,
    default: "",
  },
  dtmfNo: {
    type: Number,
    default: "",
  },
  dueDate: {
    type: Date,
  },
  // NOTE: Older tickets reference `status_id` from MySQL.
  // Going forward, use `statusId` (MongoDB ObjectId) for all new entries.
  statusId: {
    type: Schema.Types.ObjectId,
    ref: "ticket_status",
  },
  statusChangeTimestamp: { type: Number, default: Date.now },
  // Indicates whether this ticket is a merged ticket (i.e., a parent)
  isMerge: {
    type: Boolean,
    default: false,
  },

  // If this ticket was merged into another, this references the parent ticket
  mergedTo: {
    type: Schema.Types.ObjectId,
    ref: "ticketField",
    default: null,
  },

  // Optional: list of tickets that were merged into this one (only if isMerge is true)
  mergedTickets: [
    {
      type: Schema.Types.ObjectId,
      ref: "ticketField",
    },
  ],
  createdById: {
    type: Number,
  },
  createdByType: {
    type: String,
    enum: ["admin", "department", "subadmin", "agent"]
  },
  priority: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: "",
  },
  updatedAt: {
    type: Date,
  },
};

module.exports = mongoose.model(
  "autoX_ticketField",
  new Schema(customSchema, { strict: false })
);