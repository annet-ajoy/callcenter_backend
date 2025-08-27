const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const audiofiles = db.define( "audiofiles", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_department: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    filename: { type: Sequelize.STRING, validate:{ notEmpty: true }},
    systemfilename: { type: Sequelize.STRING, validate:{ notEmpty: true }}
},{
	tableName:"audiofiles"
} );

module.exports = audiofiles;