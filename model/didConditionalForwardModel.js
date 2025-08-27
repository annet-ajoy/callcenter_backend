const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const did_conditional_forward = db.define( "did_conditional_forward", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    start_time: { type: Sequelize.STRING},
    end_time: { type: Sequelize.STRING},
    sun: { type: Sequelize.INTEGER},
    mon: { type: Sequelize.INTEGER},
    tue: { type: Sequelize.INTEGER},
    wed: { type: Sequelize.INTEGER},
    thu: { type: Sequelize.INTEGER},
    fri: { type: Sequelize.INTEGER},
    sat: { type: Sequelize.INTEGER},
    user_id: { type: Sequelize.INTEGER}
},{
	tableName:"user_time_conditional_forward",
    timestamps: false, // Disable timestamps
} );

module.exports = did_conditional_forward;