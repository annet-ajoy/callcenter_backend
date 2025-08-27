const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const cc_blacklist_contacts = db.define( "cc_blacklist_contacts", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    blacklist_id: { type: Sequelize.INTEGER},
    phone_no: { type: Sequelize.STRING}
},{
	tableName:"cc_blacklist_contacts",
    timestamps: false,
} );

module.exports = cc_blacklist_contacts;