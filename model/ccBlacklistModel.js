const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const cc_blacklist = db.define( "cc_blacklist", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER},
    id_department: { type: Sequelize.INTEGER},
    name: { type: Sequelize.STRING}
},{
	tableName:"cc_blacklist",
    timestamps: false,
} );

module.exports = cc_blacklist;