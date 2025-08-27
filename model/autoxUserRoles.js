const mongoose = require("mongoose");
const { Schema } = mongoose;


const userRoleSchema = new Schema(
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
      default: 0,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("autox_user_roles", userRoleSchema);
