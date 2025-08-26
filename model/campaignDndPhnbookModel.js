const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const campaign_dnd_phonebook = db.define( "campaign_dnd_phonebook", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    campaign_id: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    dnd_id: { type: Sequelize.INTEGER, validate:{ notEmpty: true }}
},{
	tableName:"cc_campaign_dnd_phonebook"
} );

module.exports = campaign_dnd_phonebook;