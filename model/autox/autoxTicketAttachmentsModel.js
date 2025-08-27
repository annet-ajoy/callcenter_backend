const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileSchema = new Schema(
  {
    filename: String,
    originalname: String,
    path: String,
    contentType: String,
  },
);

const ticketAttachmentSchema = new Schema(
  {
    ticket_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    files: {
      type: [fileSchema],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("autox_ticket_attachments", ticketAttachmentSchema);