const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const call_flow_audio = db.define( "call_flow_audio", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    call_flow_module_id: { type: Sequelize.INTEGER},
    audiofiles: { type: Sequelize.STRING},
    target_module_id: { type: Sequelize.INTEGER},
    audio_id: { type: Sequelize.INTEGER},
    name:{type:Sequelize.STRING},
    x_position :{type:Sequelize.STRING},
    y_position :{type:Sequelize.STRING},
    dialer_tone: { type: Sequelize.INTEGER},
    

},{
	tableName:"call_flow_audio"
} );

module.exports = call_flow_audio;