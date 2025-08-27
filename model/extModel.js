const Sequelize = require("sequelize");
const db = require("../database").db;

const ext = db.define("ext", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: {
    type: Sequelize.INTEGER
  },
  created_date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  name: {
    type: Sequelize.STRING
  },
  ext: {
    type: Sequelize.STRING
  },
  reg_ext: {
    type: Sequelize.STRING
  },
  agent_email: {
    type: Sequelize.STRING
  },
  secret: {
    type: Sequelize.STRING
  },
  callerid: {
    type: Sequelize.STRING
  },
  cf_stat: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  cf_number: {
    type: Sequelize.STRING
  },
  cf_ans_stat: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  cf_ans_number: {
    type: Sequelize.STRING
  },
  cf_noans_stat: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  cf_noans_number: {
    type: Sequelize.STRING
  },
  vm_stat: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  vmem_stat: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  vm_email: {
    type: Sequelize.STRING
  },
  vm_greeting: {
    type: Sequelize.STRING
  },
  sms_stat: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  sms_number: {
    type: Sequelize.STRING
  },
  email_stat: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  email: {
    type: Sequelize.STRING
  },
  callrecord: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  outbound: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  tickets: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  status: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  noanswer_file: {
    type: Sequelize.STRING
  },
  alias: {
    type: Sequelize.STRING
  },
  zoho_clicktocall_status: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  zoho_userid: {
    type: Sequelize.STRING
  },
  user_id:  { type: Sequelize.INTEGER },
}, {
  tableName: "ext",
  timestamps: false
});

module.exports = ext;

