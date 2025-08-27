const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dashboardViews = new Schema(
  {
    _id: {
      type: String,
      required: true 
    },
    title: {
      type: String,
      required: true 
    },
    path: {
      type: String,
      required: true 
    },
    icon: {
      type: String,
      default: "" 
    },
    availableFilters: {
      type: [String],
      default: [] 
    },
    category: {
      type: String,
      default: "" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("dashboard_views", dashboardViews);
