const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const campaign_call_summary = db.define( "campaign_call_summary", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_department: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    phonebook_id: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    regNumber: { type: Sequelize.STRING},
    user_id: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    campaign_id: { type: Sequelize.INTEGER},
    connected_count: { type: Sequelize.INTEGER},
    notconnected_count: { type: Sequelize.INTEGER},
    busy: { type: Sequelize.INTEGER},
    live_calls: {type: Sequelize.INTEGER},
    agent_on_live: { type: Sequelize.INTEGER},
    ACW: { type: Sequelize.INTEGER},
    connected_duration: { type: Sequelize.INTEGER},
    total_duration: { type: Sequelize.INTEGER},
    call_delay: { type: Sequelize.INTEGER},
    attempted_contact: { type: Sequelize.INTEGER},
    cancel: { type: Sequelize.STRING},
    channel_unavailable: { type: Sequelize.STRING},
    retry: { type: Sequelize.INTEGER},
    skip: { type: Sequelize.INTEGER},
},{
	tableName:"cc_campaign_call_summary"
} );

module.exports = campaign_call_summary;