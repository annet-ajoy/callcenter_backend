const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const ObjectId = require("mongodb").ObjectId;


const phoneNumberTaskSchema = new Schema(
  {
    call_task_id: {
      type: ObjectId,
      ref: "call_task",
      required: true,
      index: true,
    },
    user_id: {
      type: Number,
      // required: true,
      index: true,
    },
    contact_name: {
      type: String,
      // required: true,
      index: true,
    },
    phone_number: {
      type: String,
      required: true,
      index: true,
    },
    start_date: {
      type: Date,
      required: false,
    },
    end_date: {
      type: Date,
      required: false,
    },
    source: {
      type: ObjectId,
      required: false,
      ref: "call_task_source",
    },
    call_status: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
      index: true,
      comment: "0=> pending, 1=> initiated, 2=> completed, 3=> expired",
    },
    customer_status_id: {
      type: Number
    },
    disposition: {
      type: ObjectId,
      ref: "call_task_disposition"
    },
    is_expired: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    re_assigned_user: {
      type: Number
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
    answeredTime: {
      type: Date
    },
    retryCount:{
      type: Number,
      default:0
    },
    description_one: {
      type: String,
    },
    customer_status_id: {
      type: Number,
    },
    description_two: {
      type: String,
    },
    purchase_date: {
      type: Date,
    },
    customer_id: {
      type: ObjectId,
      ref: "customField",
      index: true,
    },
    createdFrom: {
      type: String,   // Used to find where it was created
    },
     transferredFrom: {
      type: String,   // Used to find where it was transferred
    }
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("call_task_contacts", phoneNumberTaskSchema);
