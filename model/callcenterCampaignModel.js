const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const callcenter_campaign = db.define( "callcenter_campaign", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_department: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_agent: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    date: { type: Sequelize.DATE, validate:{ notEmpty: true }},
    name: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    description: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    forceCallerid: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    callerid: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    callRecord: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_phonebook: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    dial_type: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    template: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    templateModule: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    duplicateInPb: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    duplicateGlobal: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    dndCheck: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    dndList: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    runstatus: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    agent_type: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    livecalls: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    retry_count: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    total_contacts: { type: Sequelize.INTEGER, valiINTEGER:{ notEmpty: true }},
    answered: { type: Sequelize.DATE, validate:{ notEmpty: true }},
    noanswer: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    busy: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    cancel: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    congestion: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    chanunavail: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    abandoned: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    failed: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    dnd: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    duplicate: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    retried_contacts: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    skipped: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    totalDialed: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    totalDuration: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    totalACW: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    processingCalls: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
},

{
	tableName:"callcenter_campaign"
} );


module.exports = callcenter_campaign;