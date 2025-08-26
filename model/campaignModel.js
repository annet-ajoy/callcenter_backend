const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const campaign = db.define( "campaign", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_department: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    type: { type: Sequelize.INTEGER},
    name: { type: Sequelize.STRING},
    description: { type: Sequelize.STRING},
    total_contacts: { type: Sequelize.INTEGER},
    caller_id: { type: Sequelize.INTEGER},
    caller_id_number: {type: Sequelize.INTEGER},
    audio_file: { type: Sequelize.INTEGER},
    application_file: { type: Sequelize.INTEGER},
    application: { type: Sequelize.INTEGER},
    audio: { type: Sequelize.INTEGER},
    route: { type: Sequelize.INTEGER},
    frequency: { type: Sequelize.INTEGER},
    retry: { type: Sequelize.INTEGER},
    retry_options: { type: Sequelize.INTEGER},
    call_duration: { type: Sequelize.INTEGER},
    running_days: { type: Sequelize.STRING },
    work_time_start: { type: Sequelize.STRING},
    work_time_end: { type: Sequelize.STRING},
    work_time_end: { type: Sequelize.STRING},
    schedule_start: { type: Sequelize.DATE},
    schedule_end: { type: Sequelize.DATE},
    phonebook_duplicate_check: { type: Sequelize.INTEGER},
    gobal_duplicate_check: { type: Sequelize.INTEGER},
    dnd_check: { type: Sequelize.INTEGER},
    dnd_phonebook: { type: Sequelize.INTEGER},
    dail_type: { type: Sequelize.INTEGER},
    force_call_recording: { type: Sequelize.INTEGER},
    force_caller_id : {type: Sequelize.INTEGER},
    campaign_callerid: { type: Sequelize.INTEGER},
    template: { type: Sequelize.STRING},
    moh:{ type: Sequelize.STRING},
    retry_call_sec: { type: Sequelize.INTEGER},
    is_scheduled: { type: Sequelize.INTEGER},
},{
	tableName:"cc_campaign"
} );

module.exports = campaign;