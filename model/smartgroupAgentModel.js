const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;

const smart_group_agents = db.define( "smart_group_agents", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    smart_groupId: {type:Sequelize.INTEGER,validate:{notEmpty:true}},
    order_number: {type:Sequelize.INTEGER},
    ring_duration: {type:Sequelize.INTEGER},
    enable_call_waiting: {type:Sequelize.INTEGER},
    call_forward: {type:Sequelize.STRING},
},

{
	tableName:"smart_group_agents"
} );

module.exports = smart_group_agents;