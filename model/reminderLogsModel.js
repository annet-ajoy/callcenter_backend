const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;

const reminder_logs = db.define( "reminder_logs", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: Sequelize.INTEGER},
    activity: { type: Sequelize.STRING},
    dateTime: { type: Sequelize.DATE},
    phone_number: { type: Sequelize.STRING},
    subject: { type: Sequelize.STRING}
},
{
	tableName:"reminder_logs"
} );

module.exports = reminder_logs;