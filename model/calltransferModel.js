const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const call_transfer = db.define( "call_transfer", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_department: { type: Sequelize.INTEGER},
    from_user_id: { type: Sequelize.INTEGER},
    to_user_id: { type: Sequelize.INTEGER},
    time: { type: Sequelize.DATE},
    time: { type: Sequelize.DATE},
    call_start_time: { type: Sequelize.DATE},
    answered_time: { type: Sequelize.DATE},
    uniqueId: { type: Sequelize.STRING},
    cost: { type: Sequelize.INTEGER}
},{
	tableName:"call_transfer",
    timestamps: false,
} );

module.exports = call_transfer;