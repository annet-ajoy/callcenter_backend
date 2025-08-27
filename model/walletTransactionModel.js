const Sequelize = require("sequelize");
const db = require("../database").db;

const wallet_transaction = db.define("wallet_transaction", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  id_user: { type: Sequelize.INTEGER },
  transaction_id: {type: Sequelize.STRING},
  amount: { type: Sequelize.INTEGER },
  type: { type: Sequelize.TINYINT, comment: "0-> credit, 1-> deduct, 2-> credit debit" },
  time: { type: Sequelize.DATE },
}, {
  tableName: "wallet_transaction",
  timestamps: false
});

module.exports = wallet_transaction;