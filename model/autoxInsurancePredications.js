const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const autoxInsurancePredictionSchema = new Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "customField",
    },
    policy_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "autox_policies",
    },
    insurance_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "autox_insurance_data",
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
  "autox_insurance_predictions",
  autoxInsurancePredictionSchema
);
