const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const campaign_phonebook = db.define( "campaign_phonebook", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    phonebook_id: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    campaign_id: { type: Sequelize.INTEGER, validate:{ notEmpty: true }}
},{
	tableName:"cc_campaign_phonebook"
} );

module.exports = campaign_phonebook;