const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const autoxTokenSchema = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    id_department: {
      type: Number,
      default: 0,
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("autox_token", autoxTokenSchema);
