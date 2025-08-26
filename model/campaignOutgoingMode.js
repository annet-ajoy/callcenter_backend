const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const campaign_outgoing_reports = db.define( "campaign_outgoing_reports", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_department: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    user_id: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_campaign: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_contact: { type: Sequelize.INTEGER},
    answeredTime : { type: Sequelize.DATE},
    call_start_time : { type: Sequelize.DATE},
    call_endtime: { type: Sequelize.DATE},
    uniqueid : { type: Sequelize.STRING},
    user: {type: Sequelize.STRING},
    destination: { type: Sequelize.STRING},
    callerid: { type: Sequelize.STRING},
    duration: { type: Sequelize.STRING},
    cost: { type: Sequelize.INTEGER},
    cr_status: { type: Sequelize.STRING},
    callStatus: { type: Sequelize.INTEGER},
    cr_file: { type: Sequelize.STRING},
    dialType: { type: Sequelize.INTEGER},
    retryStatus: { type: Sequelize.INTEGER},
    route: { type: Sequelize.INTEGER},
    type: { type: Sequelize.INTEGER},
    acw_time: { type: Sequelize.STRING},
    hold_time: { type: Sequelize.INTEGER},
    call_delay: { type: Sequelize.INTEGER},
    delay_time:{ type: Sequelize.DATE},
    hangup_by: { type: Sequelize.STRING},
    dtmfSeq: { type: Sequelize.STRING},
    acw: { type: Sequelize.INTEGER},
    reminder: { type: Sequelize.INTEGER},
    retry_count: { type: Sequelize.INTEGER},
    total_duration: { type: Sequelize.STRING}
},{
	tableName:"cc_campaign_outgoing_reports"
} );

module.exports = campaign_outgoing_reports;