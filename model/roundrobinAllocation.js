const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;

const roundrobin_allocation = db.define( "roundrobin_allocation", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    callUniqueId: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    agent_id: {type:Sequelize.INTEGER},
    data: {type:Sequelize.STRING,validate:{notEmpty:true}},
    type: {type:Sequelize.STRING,validate:{notEmpty:true}},
    eventDate:{type:Sequelize.STRING,validate:{notEmpty:true}},
},

{
	tableName:"roundrobin_allocation"
} );

module.exports = roundrobin_allocation;