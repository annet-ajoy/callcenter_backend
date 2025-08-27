const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const company_contacts = db.define( "company_contacts", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	date: { type: Sequelize.DATE, validate:{ notEmpty: true }},
    id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    // companyContactNo: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    name: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    email: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    phnNo: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    assignedTo: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    status: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
},{
	tableName:"company_contacts"
} );

module.exports = company_contacts;