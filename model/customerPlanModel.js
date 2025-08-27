const Sequelize = require("sequelize");
const db = require("../database").db;

const customerPlan = db.define('ExampleModel', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  customer_id: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  pbx: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  crm: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  call_center: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'customer_plan',
  timestamps: true,
});

module.exports = customerPlan;
