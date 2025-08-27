const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const call_flow_module = db.define( "call_flow_module", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    module_type: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    call_flow_id: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    dtmf_keys	:{type:Sequelize.STRING},
    dtmf_index :{type:Sequelize.STRING},
    time_condition_index : {type:Sequelize.STRING},
    time_condition_key : {type:Sequelize.STRING},
    phonebook_index : {type:Sequelize.STRING},
    phonebook_key : {type:Sequelize.STRING},
    callroute_index : {type:Sequelize.STRING},
    callroute_key : {type:Sequelize.STRING},
    api_index : {type:Sequelize.STRING},
    api_key : {type:Sequelize.STRING},
    x_position : {type:Sequelize.STRING},
    y_position : {type:Sequelize.STRING},
    position_index : {type:Sequelize.INTEGER},
    api_user_index : {type:Sequelize.STRING},
    api_user_key : {type:Sequelize.STRING},
    call_map_index : {type:Sequelize.STRING},
    call_map_key : {type:Sequelize.STRING},
},{
	tableName:"call_flow_module"
} );

module.exports = call_flow_module;