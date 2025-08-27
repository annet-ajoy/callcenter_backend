const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const livecalls = db.define( "livecalls", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_department: { type: Sequelize.INTEGER},
    user_id: { type: Sequelize.INTEGER},
    user: { type: Sequelize.STRING},
    id_campaign: { type: Sequelize.INTEGER},
    answeredTime: { type: Sequelize.DATE},
    didNumber: { type: Sequelize.STRING},
    contact_number: { type: Sequelize.STRING},
    sourceChannel: { type: Sequelize.STRING},
    destinationChannel: { type: Sequelize.STRING},
    livekey: { type: Sequelize.STRING},
    status: { type: Sequelize.INTEGER},
    template: { type: Sequelize.INTEGER},
    templateModule: { type: Sequelize.INTEGER},
    viewed_status: { type: Sequelize.INTEGER},
    callDirection: { type: Sequelize.INTEGER},
    calltype: { type: Sequelize.INTEGER},
    uniqueId: { type: Sequelize.STRING},
    call_start_time: { type: Sequelize.DATE},
    call_end_time: { type: Sequelize.DATE},
    acw_time: { type: Sequelize.DATE},
    acw: { type: Sequelize.STRING},
    is_data_submited: { type: Sequelize.INTEGER},
    contact_status_id: { type: Sequelize.STRING},
    duration: { type: Sequelize.STRING},
    total_duration: { type: Sequelize.STRING},
    call_delay: { type: Sequelize.INTEGER},
    delay_time:{ type: Sequelize.DATE},
    is_live:{ type: Sequelize.INTEGER},
    retry_count:{ type: Sequelize.INTEGER},
},{
	tableName:"cc_livecalls"
} );

module.exports = livecalls;