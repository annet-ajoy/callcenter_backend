const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const company_kyc = db.define( "company_kyc", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: { type: Sequelize.INTEGER, validate: { notEmpty: true } },
    company_name: { type: Sequelize.STRING, validate: { notEmpty: true } },
    company_country: {type:Sequelize.STRING},
    company_state:{type: Sequelize.STRING},
    company_district:{type:Sequelize.STRING},
    company_pincode: {type: Sequelize.STRING },
    company_address: { type: Sequelize.STRING },
    company_pan_number: { type: Sequelize.STRING },
    company_gst_number: { type: Sequelize.STRING },
    company_id_card: { type: Sequelize.STRING },
    company_id_number: { type: Sequelize.STRING },
    company_upload_company_certificate: { type: Sequelize.STRING },
    company_type: { type: Sequelize.INTEGER },
},{
	tableName:"company_kyc"
} );

module.exports = company_kyc;