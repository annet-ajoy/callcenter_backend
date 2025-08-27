const Sequelize = require("sequelize");
const db = require("../database").db;

const callerMapCategory = db.define(
  "caller_map_category",
  {
    name: { type: Sequelize.STRING },
    caller_map_id: { type: Sequelize.INTEGER },
    assigned_to_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    assigned_to_type: {
      type: Sequelize.ENUM("smartgroup", "agent"),
      allowNull: true,
      defaultValue: null,
    },
    total_contacts: { type: Sequelize.INTEGER },
  },
  {
    tableName: "caller_map_category",
  }
);


module.exports = callerMapCategory;
