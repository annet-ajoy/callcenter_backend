const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketDueListSchema = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("autoX_ticket_due_list", ticketDueListSchema);