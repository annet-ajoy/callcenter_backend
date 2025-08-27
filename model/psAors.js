const Sequelize = require("sequelize");
const db = require("../database").pjSip;

const PsAors = db.define(
  "ps_aors",
  {
    id: { type: Sequelize.STRING, primaryKey: true },
    contact: {
      type: Sequelize.STRING,
    },
    max_contacts: {
      type: Sequelize.INTEGER,
      defaultValue: 5,
    },
  },
  {
    tableName: "ps_aors",
    timestamps: false,
  }
);

module.exports = PsAors;
