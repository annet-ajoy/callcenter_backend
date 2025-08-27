const mongoose = require("mongoose");

const permissionsSchema = new mongoose.Schema(
  {
    allow_normal_popup_in_autox: { type: Boolean, default: false },
    default_followup: { type: String },
    insurance_reminder_offset: { type: Number },
    service_reminder_offset: { type: Number },
    add_followup_manually: { type: Boolean }
  },
  { _id: false }
);

const roleSettingsSchema = new mongoose.Schema(
  {
    id_user: { type: Number, required: true },
    id_dept: { type: Number, required: true },
    roleId: { type: Number, required: true },
    roleName: { type: String, enum: ["admin", "subadmin", "agent", "department"], required: true },
    permissions: { type: permissionsSchema, required: true },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("autox_general_settings", roleSettingsSchema);
