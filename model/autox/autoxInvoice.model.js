const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceSchema = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    reciept: {
      type: {
        url: String,
        localPath: String
      },
      default: {},
    }
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("autox_invoices", invoiceSchema);
