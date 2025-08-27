const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const outgoing_reports = db.define( "outgoing_reports", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER},
    id_department: { type: Sequelize.INTEGER},
    id_ext: { type: Sequelize.INTEGER},
    date : { type: Sequelize.DATE},
    uniqueid: { type: Sequelize.STRING},
    destination: { type: Sequelize.STRING},
    callerid: { type: Sequelize.STRING},
    duration: { type: Sequelize.INTEGER},
    cost: { type: Sequelize.FLOAT},
    status: { type: Sequelize.STRING},
    type: { type: Sequelize.STRING},
    cr_file: { type: Sequelize.STRING},
    cr_status: { type: Sequelize.INTEGER},
    source_type: { type: Sequelize.STRING},
    user_id: { type: Sequelize.INTEGER}
},{
	tableName:"outgoing_reports",
    timestamps: false,
} );

module.exports = outgoing_reports;