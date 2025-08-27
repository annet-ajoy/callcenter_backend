const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const callTask = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3],
      default: 3,
      comment: "0 => pending, 1 => inprogress, 2 => completed, 3 => new",
    },
    expiry_date: {
      type: Date,
      index: true
    },
    assigned_type: {
      type: Number,
      enum: [0, 1],
      default: 0,
      comment: "0 => user, 1 => smart-group",
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
    assigned_users: {
      type: [Number]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("call_task", callTask);
