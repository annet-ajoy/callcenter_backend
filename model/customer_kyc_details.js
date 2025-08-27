const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;

const customer_kyc_details = db.define(
  "customer_kyc_details",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: { type: Sequelize.INTEGER, validate: { notEmpty: true } },
    name_of_authorised_signatory: { type: Sequelize.STRING },
    designation: { type: Sequelize.STRING },
    proof_of_identity_enclosed: { type: Sequelize.STRING },
    proof_of_identity_number: { type: Sequelize.STRING },
    contactNumber: { type: Sequelize.STRING },
    contact_number_fixed: { type: Sequelize.STRING },
    contact_number_email: { type: Sequelize.STRING },
    required_services: { type: Sequelize.STRING },
    proposal_ref_no: { type: Sequelize.STRING },
    installation_address: { type: Sequelize.STRING },
    authorized_person: { type: Sequelize.STRING },
    authorized_person_number: { type: Sequelize.STRING },
    authorized_person_email: { type: Sequelize.STRING },
    authorized_person_country: { type: Sequelize.STRING },
    authorized_person_state: { type: Sequelize.STRING },
    authorized_person_id_proof_number: { type: Sequelize.STRING },
    authorized_person_district: { type: Sequelize.STRING },

    authorized_person_pincode: {
      type: Sequelize.STRING(10),
      allowNull: false,
      validate: {
        isNumeric: true,
      }
    },
    authorized_person_id_number: { type: Sequelize.STRING },
    authorized_person_address: { type: Sequelize.STRING },
    acc_contact: { type: Sequelize.STRING },
    acc_contact_number: { type: Sequelize.STRING },
    acc_contact_email: { type: Sequelize.STRING },
    existing_telephone_connectivity: { type: Sequelize.INTEGER },
    amt_payable: { type: Sequelize.INTEGER },
    amt_in_words: { type: Sequelize.STRING },
    reference: { type: Sequelize.STRING },
    isVerified:{type: Sequelize.INTEGER, defaultValue:0},
    verified_by:{type:Sequelize.STRING},
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
    tableName: "customer_kyc_details",
  }
)
module.exports = customer_kyc_details
