const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const did_group_setting = db.define( "did_group_setting", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    grouping_id: { type: Sequelize.INTEGER},
    did_id: { type: Sequelize.INTEGER},
},{
	tableName:"did_group_setting",
    timestamps: false, // Disable timestamps
} );

module.exports = did_group_setting;