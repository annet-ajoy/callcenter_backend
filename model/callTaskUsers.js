const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let ObjectId = require("mongodb").ObjectId;

const callTaskUsers = new Schema(
  {
    call_task_id: {
      type: ObjectId,
      required: true,
      ref: "call_task",
      index: true,
    },
    user: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("call_task_users", callTaskUsers);
