const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const api_dtmf_keys = db.define( "api_dtmf_keys", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    api_id: { type: Sequelize.INTEGER},
    keyNo: { type: Sequelize.STRING},
    company_did_id: { type: Sequelize.INTEGER}
},{
    tableName:"api_dtmf_keys",
    timestamps: false, // Disable timestamps
} );

module.exports = api_dtmf_keys;