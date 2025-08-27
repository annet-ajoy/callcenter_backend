const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const autoxServiceHeaders = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    headers: [
      {
        name: { type: String, required: true },
        type: { type: Schema.Types.Mixed, required: true },
        filter: { type: Boolean, default: false },
        order: { type: Number, required: true },
        field_name: { type: String, required: true },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("autox_service_headers", autoxServiceHeaders);
