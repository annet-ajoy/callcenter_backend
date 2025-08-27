const Sequelize = require("sequelize");
const db = require("../database").db;

const callerMap = db.define(
  "caller_map",
  {
    name: { type: Sequelize.STRING },
    description: { type: Sequelize.TEXT },
    id_user: { type: Sequelize.INTEGER },
    id_department: { type: Sequelize.INTEGER },
  },
  {
    tableName: "caller_map",
  }
);

module.exports = callerMap;
