const mongoose = require("mongoose");
const { Schema } = mongoose;

const customSchema = new Schema(
  {
    id_user: {
      type: Number
    },
    uniqueId: {
      type: String,
      required: true,
    },
    phnNo: {
      type: Number,
    },
    userId: {
        type: Number,
      },
    eventTime: {
      type: String,
      required: true,
    },
    callTaskName: {
      type: String,
      default: "",
    },
    customer_id: {
      type: mongoose.Types.ObjectId,
      ref: "customField"
    },
  },
  { strict: false }
);

module.exports = mongoose.model("autox_calllog", customSchema);