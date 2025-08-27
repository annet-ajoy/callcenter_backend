const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const did_grouping = db.define( "did_grouping", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    did_grouping_name: { type: Sequelize.STRING},
    id_user: { type: Sequelize.INTEGER},
    id_department: { type: Sequelize.INTEGER},
    password:{ type: Sequelize.STRING},
    createdAt:{ type: Sequelize.DATE}
},{
	tableName:"did_grouping",
    timestamps: false, // Disable timestamps
} );

module.exports = did_grouping;