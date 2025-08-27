const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const plan = db.define( "plan", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    country:{type:Sequelize.STRING},
    plan_type:{type: Sequelize.INTEGER},
    amount:{type:Sequelize.INTEGER},
    talk_time:{type: Sequelize.STRING},
    numbers: { type: Sequelize.INTEGER },
    channels:{type:Sequelize.STRING},
    incoming:{type:Sequelize.STRING},
    outgoing:{type:Sequelize.STRING},
    additional_numbers:{type:Sequelize.STRING},
    additional_channels:{type:Sequelize.STRING},
},{
	tableName:"plan",
    timestamps: false, 
} );

module.exports = plan;