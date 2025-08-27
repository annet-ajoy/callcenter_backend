const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const call_flow_call_group = db.define( "call_flow_call_group", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    call_grp_id	: { type: Sequelize.INTEGER},
    moh: { type: Sequelize.STRING},
    ring_music		: { type: Sequelize.STRING},
    name		: { type: Sequelize.STRING},
    call_flow_module_id: { type: Sequelize.INTEGER},
    target_module_id	: { type: Sequelize.INTEGER},
    audiofiles	: { type: Sequelize.INTEGER},
},{
	tableName:"call_flow_call_group"
} );

module.exports = call_flow_call_group;