const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const { Schema } = mongoose;

const serviceDataSchema = new Schema(
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
      ref: "autox_service_form",
      required: true,
    },
    customer_review: {
      type: Number,
      default: 0
    },
    service_settings_id: {
      type: ObjectId,
      ref: "autox_services_settings"
    },
    vehicle_id: {
      type: ObjectId,
      ref: "autox_vehicle_data",
    },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("autox_service_data", serviceDataSchema);
