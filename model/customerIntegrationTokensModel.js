const Sequelize = require("sequelize");
const db = require("../database").db;

const CustomerIntegrationToken = db.define(
  "customer_integration_tokens",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER, unique: true, allowNull: false },
    zoho_access_token: { type: Sequelize.TEXT, allowNull: false },
    zoho_refresh_token: { type: Sequelize.TEXT, allowNull: false },
    zoho_access_token_expiry: {
      type: Sequelize.INTEGER,
      comment: "Expiry timestamp",
    },
  },
  {
    tableName: "customer_integration_tokens",
    underscored: true,
    timestamps: false
  }
);

module.exports = CustomerIntegrationToken;
