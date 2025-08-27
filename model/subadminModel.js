const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const subadmins = db.define( "subadmin", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER},
    name: { type: Sequelize.STRING},
    emailId: { type: Sequelize.STRING},
    username: { type: Sequelize.STRING},
    password: { type: Sequelize.STRING},
    phone_number_masking: { type: Sequelize.INTEGER},
},{
	tableName:"subadmin",
    timestamps: false, // Disable timestamps
} );

module.exports = subadmins;