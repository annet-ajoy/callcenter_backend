const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const cc_transfer_report = db.define( "cc_transfer_report", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    uniqueId: { type: Sequelize.STRING},
    parentUniqueId: { type: Sequelize.STRING },
    id_department: { type: Sequelize.INTEGER},
    call_start_time: { type: Sequelize.DATE},
    landed_agent: { type: Sequelize.INTEGER},
    transfered_agent: { type: Sequelize.INTEGER},
    transfer_time: { type: Sequelize.DATE},
    call_duration: { type: Sequelize.STRING},
    transfer_duration: { type: Sequelize.STRING},
    application: { type: Sequelize.STRING},
    call_end_time: { type: Sequelize.DATE},
    transfer_department: { type: Sequelize.INTEGER},
    call_landed_department: { type: Sequelize.INTEGER},
    transfer_call_status: { type: Sequelize.INTEGER},
    first_attempted_agent: { type: Sequelize.INTEGER},
    customer_number: { type: Sequelize.INTEGER},
    call_recording: { type: Sequelize.STRING},
    first_call_end_time: { type: Sequelize.DATE},
    transfer_call_recording: { type: Sequelize.STRING},
    initial_application: { type: Sequelize.STRING},
    final_application: { type: Sequelize.STRING},
    call_type: { type: Sequelize.STRING},
    initial_app_id: { type: Sequelize.INTEGER},
    final_app_id: { type: Sequelize.INTEGER},
},{
    tableName:"cc_transfer_report"
} );

module.exports = cc_transfer_report;