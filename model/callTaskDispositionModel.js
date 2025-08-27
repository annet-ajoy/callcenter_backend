const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;
var Schema = mongoose.Schema;
const callTaskSchema = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
    },
    id_department: {
      type: Number,
      required: true,
    },
    name: {
        type: String,
        required: true,
    },
    assignRole: {
      type: ObjectId,
      ref: "autox_user_roles"
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model('call_task_disposition', new Schema(callTaskSchema, { strict: false} ));