const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;

const broadcast_event = db.define( "broadcast_event", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    event_name: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    dtmf_key:{type:Sequelize.INTEGER,validate:{notEmpty:true}},
    event_date_time: { type: Sequelize.DATE, validate:{ notEmpty: true }},
    campaign_id: {type:Sequelize.INTEGER,validate:{notEmpty:true}},
    createdAt: { type: Sequelize.DATE, validate:{ notEmpty: true }},
    updatedAt: { type: Sequelize.DATE, validate:{ notEmpty: true }}
},

{
	tableName:"broadcast_event"
} );

module.exports = broadcast_event;