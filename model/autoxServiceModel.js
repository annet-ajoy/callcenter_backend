const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const autoxServiceSchema = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    id_department: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      required: true,
    },
    kilometer: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("autox_services_settings", autoxServiceSchema);
