const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;

const smart_group = db.define( "smart_group", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    name: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    emailId	: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    password: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    no_of_agents: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    call_back_request:{type:Sequelize.STRING},
    isLoop: {type:Sequelize.STRING},
    enable_sticky_agent:{type:Sequelize.STRING},
    enable_sticky_bind: {type:Sequelize.STRING},
    music_on_hold: { type: Sequelize.STRING},
    enable_music_on_hold:{type:Sequelize.STRING},
    ring_type: {type:Sequelize.STRING},
    ring_duration: {type:Sequelize.STRING},
    loop_count: {type:Sequelize.INTEGER},
    moh_id: {type:Sequelize.STRING},
    maximum_duration: {type:Sequelize.STRING},
    enable_call_waiting: {type:Sequelize.INTEGER},
    id_department: {type:Sequelize.INTEGER},
    sticky_time_out_day: {type:Sequelize.INTEGER},
    sticky_time_out_time: {type:Sequelize.STRING},
    sticky_call_type: {type:Sequelize.INTEGER},
    last_answered_user: {type:Sequelize.INTEGER},
    last_answered_user_pos: {type:Sequelize.INTEGER},
    show_missedcall_to: {type:Sequelize.INTEGER},
    unique_id: { type: Sequelize.STRING(10) },
    enable_redirect_on_busy: {type:Sequelize.INTEGER},
    redirect_on_busy_smartgroup_id: {type:Sequelize.INTEGER},
},
{
	tableName:"smart_group"
} );

module.exports = smart_group;
    