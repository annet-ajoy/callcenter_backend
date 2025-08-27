const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const { Schema } = mongoose;


const vehicleOutletSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dealer_id: {
      type: ObjectId,
      ref: "autox_vehicle_dealers"
    },
    region_id: {
      type: ObjectId,
      ref: "autox_vehicle_region"
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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("autox_vehicle_outlet", vehicleOutletSchema);
