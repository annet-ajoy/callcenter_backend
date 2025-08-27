const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = require("mongodb").ObjectId;

const autoxServices = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    repair_order_date: {
      type: String,
    },
    repair_order_no: {
      type: String,
    },
    workshop: {
      type: String,
    },
    bill_date: {
      type: String,
    },
    distance: {
      type: Number,
      comment: "distance in meter",
    },
    service_type: {
      type: String,
    },
    total_amount: {
      type: Number,
    },
    customer_review: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("autox_services", autoxServices);
