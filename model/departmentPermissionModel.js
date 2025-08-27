const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const department_permissions = db.define( "department_permissions", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER},
    id_department: { type: Sequelize.INTEGER},
    privilege_id: { type: Sequelize.INTEGER},
    is_active: { type: Sequelize.INTEGER},
    add_permission: { type: Sequelize.INTEGER},
    edit_permission: { type: Sequelize.INTEGER},
    view_permission: { type: Sequelize.INTEGER},
    delete_permission: { type: Sequelize.INTEGER},
    hide_report: { type: Sequelize.INTEGER},
    phn_number_masking: { type: Sequelize.INTEGER},
    hide_recordings: { type: Sequelize.INTEGER}
},{
	tableName:"department_permissions"
} );

module.exports = department_permissions;