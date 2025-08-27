const mongoose = require("mongoose");
const { INTEGER } = require("sequelize");
const Schema = mongoose.Schema;


const MenuConfigSchema = new Schema(
  {
    menuId: { type: String, required: true },
    position: { type: String },
    filters: { type: [String], default: [] },
    enabled: { type: Boolean, default: false }
  },
  { _id: false }
);

const DashboardUserViewSchema = new Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ["admin", "subadmin", "department"],
      required: true
    },
    menus: {
      type: [MenuConfigSchema],
      default: []
    },
     callType: {
      type: Number,    // 0 = both , 1 = incoming , 2 = outg
      default: 0
     }
  },
  { timestamps: true }
);

module.exports = mongoose.model("dashboard_user_view", DashboardUserViewSchema);
