const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const unique_missed_reports = db.define( "unique_missed_reports", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER},
    id_department: { type: Sequelize.INTEGER},
    insertedTime : { type: Sequelize.DATE},
    firstCallStartTime: { type: Sequelize.DATE},
    latestCallStartTime: { type: Sequelize.DATE},
    answeredCallStartTime: { type: Sequelize.DATE},
    sourceNumber: { type: Sequelize.STRING},
    didNumber: { type: Sequelize.STRING},
    connectedDuration: { type: Sequelize.INTEGER},
    callStatus: { type: Sequelize.STRING},
    application: { type: Sequelize.STRING},
    callUniqueId: { type: Sequelize.STRING},
    dtmfSeq: { type: Sequelize.STRING},
    dtmfSeq_name: { type: Sequelize.STRING},
    missed_count: { type: Sequelize.INTEGER},
    callback_count: { type: Sequelize.INTEGER},
    missed_status: { type: Sequelize.INTEGER},
    type: { type: Sequelize.STRING},
    destination_app: { type: Sequelize.STRING},
    destination_name: { type: Sequelize.STRING},
    destination_id: { type: Sequelize.INTEGER},
    user_id: { type: Sequelize.INTEGER},
},{
	tableName:"unique_missed_reports",
    timestamps: false,
} );

module.exports = unique_missed_reports;