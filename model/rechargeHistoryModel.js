const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;

const rechargeHistory = db.define(
  "recharge_history",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: {type:Sequelize.INTEGER},
    date: {type:Sequelize.DATE},
    recharge:{type:Sequelize.FLOAT},
    order_id:{type:Sequelize.FLOAT},
    credit:{type:Sequelize.FLOAT},
    sms_balance:{type:Sequelize.STRING},
    sms_limit:{type:Sequelize.INTEGER},
    description:{type:Sequelize.TEXT},
    user: {type:Sequelize.INTEGER}
  },
  {
    tableName: "recharge_history",
    timestamps: false,
  }
)

module.exports = rechargeHistory