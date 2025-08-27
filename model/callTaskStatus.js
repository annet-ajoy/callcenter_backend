const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;
var Schema = mongoose.Schema;
const callTaskSchema = new Schema(
  {
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
  },
  { timestamps: true }
);
module.exports = mongoose.model('call_task_status', new Schema(callTaskSchema, { strict: false} ));
