const mongoose = require("mongoose");
const { Schema } = mongoose;

const voxbayTicketsModel = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    id_department: {
      type: Number,
      default: 0,
    },
  },
  {
    strict: false,
  }
);

module.exports = mongoose.model('voxbayTickets', voxbayTicketsModel);
