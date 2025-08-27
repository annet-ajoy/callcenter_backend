const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const crm_vendor = db.define( "crm_vendor", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    start: { type: Sequelize.INTEGER},
    id_user: { type: Sequelize.INTEGER},
    connect: { type: Sequelize.STRING},
    disconnect: { type: Sequelize.STRING},
    crm_vendor: { type: Sequelize.STRING},
    cdr: { type: Sequelize.INTEGER},
    status: { type: Sequelize.STRING},
    missed_call: { type: Sequelize.STRING},
    headers: { type: Sequelize.STRING},
},{
    tableName:"crm_vendor"
} );

module.exports = crm_vendor;