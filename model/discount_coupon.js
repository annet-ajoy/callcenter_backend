const Sequelize = require("sequelize");
const db = require("../database").db;
const discount_coupon = db.define(
  "discount_coupons",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    coupon_code: {type:Sequelize.STRING},
    discount: {type:Sequelize.INTEGER},
    expiry:{type: Sequelize.DATE},
    used: {type:Sequelize.INTEGER},
    used_by: {type:Sequelize.STRING},
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

  }
)
module.exports = discount_coupon