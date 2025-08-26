const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const agent_campaign = db.define( "agent_campaign", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_campaign: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    runstatus: { type: Sequelize.INTEGER},
    dialType: { type: Sequelize.INTEGER},
    currentStatus: { type: Sequelize.INTEGER},
    acwStartTime: { type: Sequelize.DATE},
    agentChannel: { type: Sequelize.STRING},
    liveKey: { type: Sequelize.STRING},
    contactId: { type: Sequelize.INTEGER},
    connectedNumber: { type: Sequelize.STRING},
    acwEndTime: { type: Sequelize.DATE},
    uniqueId: { type: Sequelize.STRING},
    acwEndTime: { type: Sequelize.DATE},
    loginStartTime:{type: Sequelize.DATE},
    logoutTime:{type: Sequelize.DATE},
    is_login:{type: Sequelize.INTEGER},
    caller_id:{type: Sequelize.STRING},
},{
	tableName:"cc_user_campaign"
} );

module.exports = agent_campaign;