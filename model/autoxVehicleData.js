const moment = require("moment");
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const { Schema } = mongoose;

const vehicleDataSchema = new Schema(
  {
    customer_id: {
      type: ObjectId,
      ref: "call_task_contacts",
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
    vehicle_number: {
      type: String,
      index: true,
      set: normalizeVehicleField,
    },
    vehicle_engine_no: {
      type: String,
      index: true,
      set: normalizeVehicleField,
    },
    template_id: {
      type: ObjectId,
      ref: "autox_vehicle_form",
      required: true,
    },
    vehicle_id: {
      type: ObjectId,
      ref: "autox_vehicle_details",
    },
    purchase_date: {
      type: Date,
      set: (val) => {
        if (typeof val === "string" && val.includes("-")) {
          // Try parsing DD-MM-YYYY format
          const m = moment(val, "DD-MM-YYYY", true);
          return m.isValid() ? m.toDate() : val;
        }
        return val;
      },
    },
  },
  { timestamps: true, strict: false }
);

vehicleDataSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate();
  if (!update) return next();

  const processField = (field) => {
    if (update[field]) {
      update[field] = normalizeVehicleField(update[field]);
    }
    if (update.$set && update.$set[field]) {
      update.$set[field] = normalizeVehicleField(update.$set[field]);
    }
  };

  processField('vehicle_number');
  processField('vehicle_engine_no');

  next();
});

function normalizeVehicleField(value) {
  if (!value) return value;
  return value.replace(/\s+/g, "").toLowerCase(); // remove all spaces, make lowercase
}

module.exports = mongoose.model("autox_vehicle_data", vehicleDataSchema);
