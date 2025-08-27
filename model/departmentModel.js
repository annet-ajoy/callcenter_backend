const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const departments = db.define( "department", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.STRING},
    phone_number: { type: Sequelize.STRING},
    created_date: { type: Sequelize.DATE},
    name: { type: Sequelize.STRING},
    email: { type: Sequelize.STRING},
    secret: { type: Sequelize.STRING},
    status: { type: Sequelize.INTEGER},
    agentCount: { type: Sequelize.INTEGER},
    phone_number_masking: { type: Sequelize.INTEGER},
},{
	tableName:"departments",
    timestamps: false, // Disable timestamps
} );

module.exports = departments;