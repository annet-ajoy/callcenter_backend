const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const api_input_parameters = db.define( "api_input_parameters", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    api_id: { type: Sequelize.INTEGER},
    company_did_id: { type: Sequelize.INTEGER},
    inputKey: { type: Sequelize.STRING},
    value: { type: Sequelize.STRING},
    description: { type: Sequelize.STRING},
    custom_values: { type: Sequelize.INTEGER},
    date_format: { type: Sequelize.STRING},
    appended_key: { type: Sequelize.STRING},
    digit_count: { type: Sequelize.INTEGER},
    status: { type: Sequelize.INTEGER},
    call_status_type: { type: Sequelize.INTEGER},
},{
    tableName:"api_input_parameters",
    timestamps: false, // Disable timestamps
} );

module.exports = api_input_parameters;