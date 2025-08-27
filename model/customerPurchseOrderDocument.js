const mongoose = require("mongoose");
const { Schema } = mongoose;

const customSchema = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
    },
    id_department: {
      type: Number,
    },
    document_name: {
      type: String,
      required: true,
    }
  },
  { strict: false }
);

module.exports = mongoose.model("customerPurchseOrderDocument", customSchema);