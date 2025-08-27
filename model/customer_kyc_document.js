const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;

const customer_kyc_document = db.define(
  "customer_kyc_document",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: { type: Sequelize.INTEGER, validate: { notEmpty: true } },
    id_proof_type: { type: Sequelize.INTEGER },
    id_proof1: { type: Sequelize.STRING },
    id_proof2: { type: Sequelize.STRING },
    photo: { type: Sequelize.STRING },
    company_proof_type: { type: Sequelize.INTEGER },
    company_proof: { type: Sequelize.STRING },
    customer_agreement_form: { type: Sequelize.STRING },
    purchase_order_type: { type: Sequelize.INTEGER },
    purchase_order: { type: Sequelize.STRING },
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
  },
  {
    tableName: "customer_kyc_document",
  }
)
module.exports = customer_kyc_document
