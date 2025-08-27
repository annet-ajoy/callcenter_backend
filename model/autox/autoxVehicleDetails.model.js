const mongoose = require("mongoose");
const { Schema } = mongoose;

const vehicleDetailsSchema = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    id_department: {
      type: Number,
      default: 0,
      index: true,
    },
    name: {
      type: String
    },
    cc: {
      type: Number
    },
    type: {
      type: String,
    },
    modelName: {
      type: [String],
    },
    brand: {
      type: String,
    },
    variant: {
      type: [String],
    },
    color: {
      type: [String],
    },
    fuelType: {
      type: String,
    },
    vehicleImage: {
      type: {
        url: String,
        localPath: String
      },
      default: {},
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("autox_vehicle_details", vehicleDetailsSchema);
