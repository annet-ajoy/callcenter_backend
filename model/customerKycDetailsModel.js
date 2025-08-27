const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const customer_kyc_details = db.define( "customer_kyc_details", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: { type: Sequelize.INTEGER, validate: { notEmpty: true } },
    // campany_name: { type: Sequelize.STRING, validate: { notEmpty: true } },
    // campany_email: { type: Sequelize.STRING },
    // campany_country: {type:Sequelize.STRING},
    // campany_state:{type: Sequelize.STRING},
    // campany_district:{type:Sequelize.STRING},
    // campany_pincode: {type: Sequelize.STRING },
    // company_type: { type: Sequelize.INTEGER },
    // company_address: { type: Sequelize.STRING },
    // company_number: { type: Sequelize.STRING },
    // company_GSTN: { type: Sequelize.STRING },
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
    authorized_person_pincode: { type: Sequelize.STRING },
    authorized_person_id_proof_number: { type: Sequelize.STRING },
    authorized_person_address: { type: Sequelize.STRING },
    acc_contact: { type: Sequelize.STRING },
    acc_contact_number: { type: Sequelize.STRING },
    acc_contact_email: { type: Sequelize.STRING },
    existing_telephone_connectivity: { type: Sequelize.INTEGER },
    amt_payable: { type: Sequelize.INTEGER },
    amt_in_words: { type: Sequelize.STRING },
    reference: { type: Sequelize.STRING },
    isVerified:{type: Sequelize.INTEGER, defaultValue:0},
    verified_by:{type:Sequelize.STRING}
},{
	tableName:"customer_kyc_details"
} );

module.exports = customer_kyc_details;