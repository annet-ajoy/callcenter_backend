const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;

const razorpay = db.define(
  "razorpay",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    amount: {type:Sequelize.INTEGER},
    amount_paid: {type:Sequelize.INTEGER},
    currency:{type:Sequelize.STRING},
    order_id:{type:Sequelize.STRING},
    payment_id:{type:Sequelize.STRING},
    razorpay_signature:{type:Sequelize.STRING},
    customer_id:{type:Sequelize.INTEGER},
    status:{type:Sequelize.STRING},
    plan_type:{type:Sequelize.INTEGER},
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    }
  },
  {
    tableName: "razorpay"
  }
)

module.exports = razorpay