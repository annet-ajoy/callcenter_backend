const moment = require("moment");
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const { Schema } = mongoose;

const insuranceDataSchema = new Schema(
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
    policy: {
      type: ObjectId,
      ref: "autox_policies",
    },
    vehicle_id: {
      type: ObjectId,
      ref: "autox_vehicle_data",
    },
    insurance_start_date: {
      type: Date,
      set: (val) => {
        if (typeof val === "string" && val.includes("-")) {
          // Try parsing DD-MM-YYYY format
          const m = moment(val, "DD-MM-YYYY", true);
          return m.isValid() ? m.toDate() : val;
        }
        return val;
      },
      default: new Date()
    },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("autox_insurance_data", insuranceDataSchema);
