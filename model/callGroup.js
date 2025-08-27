const Sequelize = require("sequelize");
const db = require("../database").db;

const callgroup = db.define("callgroup", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  id_user: { type: Sequelize.INTEGER, allowNull: false },
  created_date: { type: Sequelize.DATE, allowNull: false },
  name: { type: Sequelize.STRING, allowNull: false },
  password: { type: Sequelize.STRING, allowNull: false },
  members: { type: Sequelize.INTEGER, allowNull: false },
  member_count: { type: Sequelize.INTEGER, allowNull: false },
  type: { type: Sequelize.INTEGER, allowNull: false, validate: { isIn: [[0, 1, 2]] } },
  member_names: { type: Sequelize.STRING, allowNull: false },
  sms_answer: { type: Sequelize.INTEGER, allowNull: false },
  sms_noanswer: { type: Sequelize.INTEGER, allowNull: false },
  sms_first: { type: Sequelize.INTEGER, allowNull: false },
  sms_last: { type: Sequelize.INTEGER, allowNull: false },
  sms_number: { type: Sequelize.STRING, allowNull: true },
  new_context: { type: Sequelize.INTEGER, allowNull: false },
  moh_class: { type: Sequelize.STRING, allowNull: false },
  moh_userdefined_name: { type: Sequelize.STRING, allowNull: false },
  ring_duration: { type: Sequelize.INTEGER, allowNull: false },
  bye_audio: { type: Sequelize.STRING, allowNull: false },
  sticky_agent: { type: Sequelize.INTEGER, allowNull: false },
  sticky_agent_strict: { type: Sequelize.INTEGER, allowNull: false },
}, {
  tableName: "callgroup"
});

module.exports = callgroup;
