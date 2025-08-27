const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = require("mongodb").ObjectId;

const autoxInsuranceInfo = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    start_date: {
      type: String,
    },
    due_date: {
      type: String,
    },
    last_policy_no: {
      type: String,
    },
    product_type: {
      type: String,
    },
    premium: {
      type: Number,
    }
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("autox_insurance_info", autoxInsuranceInfo);
