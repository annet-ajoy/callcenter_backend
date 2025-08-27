const mongoose = require("mongoose");
const { Schema } = mongoose;

const breakDataSchema = new Schema({
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
  description: {
    type: String,
    default: "",
  },
  allow_incoming: {
    type: Boolean,
    default: false,
  },
  allow_outgoing: {
    type: Boolean,
    default: false,
  },
  break_type: {
    type: Number, 
  }
});

module.exports = mongoose.model(
  "autox_break_data",
  breakDataSchema
);
