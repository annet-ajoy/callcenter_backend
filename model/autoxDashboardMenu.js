const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = require("mongodb").ObjectId;


const autoxDashboardMenu = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    agent_id: {
      type: Number,
      index: true,
      default: null,
      comment: "user_id"
    },
    department_id: {
      type: Number,
      index: true,
    },
    subadmin_id: {
      type: Number,
      index: true,
    },
    disposition_id: {
      type: Number,
    },
    calltask_id: {
      type: ObjectId,
      ref: "call_task"
    },
    icon: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("autox_dashboard_menus", autoxDashboardMenu);
