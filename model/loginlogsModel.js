const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const login_logs = db.define( "login_logs", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_master: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    token: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_department: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_agent: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    date: { type: Sequelize.DATE, validate:{ notEmpty: true }},
    ipaddress: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    useragent: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    status: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    attempted_by: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
},{
	tableName:"login_logs"
} );

module.exports = login_logs;