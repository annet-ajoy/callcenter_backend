const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const { Schema } = mongoose;

const invoiceDataSchema = new Schema(
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
      ref: "autox_insurance_form",
      required: true,
    },
    vehicle_id: {
      type: ObjectId,
      ref: "autox_vehicle_data",
    },
    reciept: {
      type: {
        url: String,
        localPath: String
      },
      default: {},
    },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("autox_invoice_data", invoiceDataSchema);
