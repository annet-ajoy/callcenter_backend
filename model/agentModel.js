const Sequelize = require("sequelize");
const db = require("../database").db;

const agents = db.define("agents", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_user: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  id_department: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  date: {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  last_name:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  employee_id:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  regNumber: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  secret: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  phn_number:{
    type: Sequelize.INTEGER,
    allowNull: true
  },
  did: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  code: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  location: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  adminPrivilage: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  callRecord: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  allowOutbound: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  hide_reports: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  currentBreakStartDate: {
    type: Sequelize.DATE,
    allowNull: true
  },
  currentBreakId: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  currentBreakName: {
    type: Sequelize.STRING,
    allowNull: true
  },
  currentSessionId: {
    type: Sequelize.STRING,
    allowNull: true
  },
  currentSessionStart: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  currentCallStatus: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  currentCallAnsTime: {
    type: Sequelize.DATE,
    allowNull: true
  },
  popup_status: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  lastCallEndTime: {
    type: Sequelize.DATE,
    allowNull: true
  },
  liveCallKey: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  loginStartTime: {
    type: Sequelize.DATE,
    allowNull: true
  },
  logged_in: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  isAgent: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  show_callrecording: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  show_campaign_report: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  enable_crm_edit: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  hand_over: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  phn_number_mask: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  allowCrmSharing:{
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  user_id:  { type: Sequelize.INTEGER },
}, {
  tableName: "agents",
  timestamps: false // Assuming there are no createdAt and updatedAt fields
});

module.exports = agents;
