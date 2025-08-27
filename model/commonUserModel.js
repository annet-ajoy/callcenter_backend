const Sequelize = require("sequelize");
const db = require("../database").db;

const users = db.define("user", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  id_user: { type: Sequelize.INTEGER },
  id_department: { type: Sequelize.INTEGER },
  first_name: { type: Sequelize.STRING },
  last_name: { type: Sequelize.STRING },
  username: { type: Sequelize.STRING },
  employee_id: { type: Sequelize.STRING },
  email_id: { type: Sequelize.STRING },
  phn_number: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  adminPrivilage: { type: Sequelize.INTEGER },
  allowOutbound: { type: Sequelize.INTEGER },
  show_callrecording: { type: Sequelize.INTEGER },
  show_campaign_report: { type: Sequelize.INTEGER },
  enable_crm_edit: { type: Sequelize.INTEGER },
  phn_number_mask: { type: Sequelize.INTEGER },
  handover: { type: Sequelize.INTEGER },
  enableForward: { type: Sequelize.INTEGER },
  enableVoicemail: { type: Sequelize.INTEGER },
  enableSmsAlert: { type: Sequelize.INTEGER },
  enableTicket: { type: Sequelize.INTEGER },
  isLogin: { type: Sequelize.INTEGER },
  upload_image: {type: Sequelize.STRING},
  designation: { type: Sequelize.STRING, defaultValue: null, comment: "autox_user_roles" },
  google_app_password: { type: Sequelize.STRING, defaultValue: null }
}, {
  tableName: "user"
});

module.exports = users;
