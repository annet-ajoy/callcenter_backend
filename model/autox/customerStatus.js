const mongoose = require("mongoose");
const { Schema } = mongoose;

const customerStatusSchema = new Schema({
  id_user: {
    type: Number,
    required: true,
    index: true,
  },
  id_department: {
    type: Number,
    default: 0,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(
  "autox_customer_status",
  customerStatusSchema
);
