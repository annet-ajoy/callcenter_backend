const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const subadmin_departments = db.define( "subadmin_departments", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: Sequelize.DATE},
    id_subadmin: { type: Sequelize.INTEGER},
    id_dept: { type: Sequelize.STRING}
},{
	tableName:"subadmin_departments",
    timestamps: false, // Disable timestamps
} );

module.exports = subadmin_departments;