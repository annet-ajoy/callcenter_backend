const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const api_api = db.define( "api_api", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    did_id: { type: Sequelize.INTEGER},
    company_did_id: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    api_url: { type: Sequelize.STRING},
    method: { type: Sequelize.INTEGER},
    api_provider: { type: Sequelize.STRING},
    category: { type: Sequelize.INTEGER},
    dtmfKey: { type: Sequelize.STRING},
    dtmf: { type: Sequelize.INTEGER},
    ivr: { type: Sequelize.STRING},
    incoming_or_outgoing: { type: Sequelize.INTEGER},
    form_type: { type: Sequelize.INTEGER}, 
    isEnabled: { type: Sequelize.INTEGER},
    phoneNo_field: { type: Sequelize.STRING},
    call_status: { type: Sequelize.INTEGER}
},{
    tableName:"api_api",
    timestamps: false, // Disable timestamps
} );

module.exports = api_api;