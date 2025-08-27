const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leadToCustomerReportSchema = new Schema(
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
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "leadField",
      required: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customField",
      required: true,
    },
    convertedBy: {
      id: {
        type: Number,
        required: true,
      },
      role: {
        type: String,
        enum: ["admin", "subadmin", "department", "agent"],
        required: true,
      },
    },
    leadCreatedDate: {
      type: Date,
    },
    customerCreatedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("lead_to_customer_reports", leadToCustomerReportSchema);
