const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const subadmin_permissions = db.define( "subadmin_permissions", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER},
    subadmin_id: { type: Sequelize.INTEGER},
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
	tableName:"subadmin_permissions"
} );

module.exports = subadmin_permissions;