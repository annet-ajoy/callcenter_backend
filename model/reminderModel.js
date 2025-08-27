const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;

const reminder = db.define( "reminder", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER, },
    id_department: { type: Sequelize.INTEGER, },
    user_id: { type: Sequelize.INTEGER, },
    reminder_date: { type: Sequelize.DATE, },
    subject: { type: Sequelize.STRING, },
    reminder: { type: Sequelize.STRING, },
    phone_number: { type: Sequelize.STRING},
    status:{type:Sequelize.INTEGER,},
    createdAt: { type: Sequelize.DATE, },
    updatedAt: { type: Sequelize.DATE, },
    created_type: {type:Sequelize.INTEGER,},
    campaign_id: {type:Sequelize.INTEGER,},
    customer_name: { type: Sequelize.STRING},
    template_id: { type: Sequelize.STRING,allowNull:true,defaultValue:null},
},

{
	tableName:"cc_reminder"
} );

module.exports = reminder;