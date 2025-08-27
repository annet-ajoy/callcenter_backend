const Sequelize = require("sequelize");
const db = require("../database").db;

const callerMapPhoneNumber = db.define(
  "caller_map_phonenumber",
  {
    caller_map_id: { type: Sequelize.INTEGER },
    caller_map_category_id: { type: Sequelize.INTEGER },
    name: { type: Sequelize.STRING },
    contact_number: { type: Sequelize.STRING, required: true },
    name: { type: Sequelize.STRING, defaultValue: null },
    notes: { type: Sequelize.STRING, defaultValue: null },
  },
  {
    tableName: "caller_map_phonenumber",
  }
);


module.exports = callerMapPhoneNumber;
