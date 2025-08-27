const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const api_header_parameters = db.define( "api_header_parameters", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    api_id: { type: Sequelize.INTEGER},
    company_did_id: { type: Sequelize.INTEGER},
    headersKey: { type: Sequelize.STRING},
    value: { type: Sequelize.STRING},
    description: { type: Sequelize.STRING},
    status: { type: Sequelize.INTEGER}
},{
    tableName:"api_header_parameters",
    timestamps: false, // Disable timestamps
} );

module.exports = api_header_parameters;