const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const api_call_status = db.define( "api_call_status", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    input_parameter_id: { type: Sequelize.INTEGER},
    name: { type: Sequelize.STRING},
    value: { type: Sequelize.STRING}
},{
    tableName:"api_call_status",
    timestamps: false, // Disable timestamps
} );

module.exports = api_call_status;