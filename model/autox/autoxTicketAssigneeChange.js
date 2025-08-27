const mongoose = require("mongoose");
const { Schema } = mongoose;

const ticketAssigneeChange = new Schema({
  ticketId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: "autoX_ticketField",
  },
  assignToId: {
    type: Number,
    required: true,
  },
  assignToType: {
    type: String,
    enum: ["agent", "department"],
  },
  reason: {
    type: String,
  },
});

module.exports = mongoose.model("autoX_ticket_assignee_change", ticketAssigneeChange);