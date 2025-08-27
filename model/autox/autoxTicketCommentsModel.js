const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketCommentSchema = new Schema(
  {
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "autoX_ticketField",
      index: true,
    },
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    comment: {
      type: String,
      required: true,
    },
    role: {
        type: Number,
        enum: [1, 2, 3, 4], // 1 = admin, 2 = subadmin, 3 = user, 4 = department
        default: 4,
    },
    sender_id: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("autoX_ticket_comments", ticketCommentSchema);