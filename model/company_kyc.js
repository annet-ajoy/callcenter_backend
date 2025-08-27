const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;

const company_kyc = db.define(
  "company_kyc",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: { type: Sequelize.INTEGER, validate: { notEmpty: true } },
    company_name: { type: Sequelize.STRING},
    company_type: {type: Sequelize.INTEGER},
    company_country: {type:Sequelize.STRING},
    company_state: {type:Sequelize.STRING},
    company_district:{type:Sequelize.STRING},
    company_pincode: {type: Sequelize.INTEGER},
    company_address: { type: Sequelize.STRING },
    company_pan_number: {type: Sequelize.STRING},
    company_gst_number: {type:Sequelize.INTEGER},
    // pass integer as options
    company_id_card:{type:Sequelize.INTEGER},
    company_id_number:{type:Sequelize.INTEGER},
    company_upload_company_certificate:{type:Sequelize.STRING},
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
    tableName: "company_kyc",
  }
)
module.exports = company_kyc