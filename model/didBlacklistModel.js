const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const did_blacklist = db.define( "did_blacklist", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    did_id: { type: Sequelize.INTEGER},
    blacklist_id: { type: Sequelize.INTEGER}
},{
	tableName:"did_blacklist",
    timestamps: false,
} );

module.exports = did_blacklist;