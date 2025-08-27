const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const moh_files = db.define( "moh_files", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    moh_id: { type: Sequelize.STRING},
    file_name: { type: Sequelize.STRING},
},{
	tableName:"moh_files"
} );

module.exports = moh_files;