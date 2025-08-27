const mongoose = require("mongoose");
const { Schema } = mongoose;

const dealersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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

module.exports = mongoose.model("autox_vehicle_dealers", dealersSchema);
