const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const autoxServicePredictionSchema = new Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "customField",
    },
    currentServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "autox_services_settings",
    },
    nextServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "autox_services_settings",
    },
    predictedDate: {
      type: Date,
      required: false,
    },
    actualDate: {
      type: Date,
      required: false,
    },
    predictedDays: {
      type: Number,
    },
    kmPerDay: {
      type: Number,
    },
    criteriaOfService: {
      type: String,
      enum: ["kilometer_reached", "duration_reached"],
    },
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    id_department: {
      type: Number,
      default: 0,
    },
    assignedTo: {  //user_id
      type: Number
    },
    call_status: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
      index: true,
      comment: "0=> pending, 1=> initiated, 2=> completed, 3=> expired",
    },
    answeredTime: {
      type: Date
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "autox_service_predictions",
  autoxServicePredictionSchema
);
