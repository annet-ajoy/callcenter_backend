const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const { Schema } = mongoose;

const commonFormDataSchema = new Schema(
  {
    customer_id: {
      type: ObjectId,
      ref: "autox_customer_data",
      required: true,
      index: true,
    },
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    id_department: {
      type: Number,
      required: true,
      index: true,
    },
    template_id: {
      type: ObjectId,
      ref: "autox_common_form",
      required: true,
    },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("autox_common_form_data", commonFormDataSchema);
