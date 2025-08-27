const Sequelize = require('sequelize');
const db = require('../database').db;

const login_attempts = db.define('login_attempts', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_user: {
    type: Sequelize.INTEGER,
  },
  email: {
    type: Sequelize.STRING,
  },
  secret: {
    type: Sequelize.STRING,
  },
  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  status: {
    type: Sequelize.INTEGER,
  },
  ipaddress: {
    type: Sequelize.STRING,
  },
  useragent: {
    type: Sequelize.STRING,
  },
}, {
  timestamps: false,
  tableName: 'login_attempts',
});

module.exports = login_attempts;
