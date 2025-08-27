const Sequelize = require("sequelize");
const db = require("../database").pjSip;

const PsAuths = db.define(
  "ps_auths",
  {
    id: { type: Sequelize.STRING, primaryKey: true },
    auth_type: {
      type: Sequelize.STRING,
      defaultValue: "userpass",
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "ps_auths",
    timestamps: false,
  }
);

module.exports = PsAuths;
