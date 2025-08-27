const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const   livecalls = db.define( "livecalls", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    id_department: { type: Sequelize.INTEGER},
    time: { type: Sequelize.DATE},
    answeredTime: { type: Sequelize.DATE},
    source: { type: Sequelize.STRING},
    sourceName: { type: Sequelize.STRING},
    destination: { type: Sequelize.STRING},
    type: { type: Sequelize.STRING},
    livekey: { type: Sequelize.STRING},
    extension: { type: Sequelize.STRING},
    answeredAgentName: { type: Sequelize.STRING},
    id_ext: { type: Sequelize.INTEGER},
    currentStatus: { type: Sequelize.INTEGER},
    barge_code: { type: Sequelize.STRING},
    channel: { type: Sequelize.STRING},
    uniqueId: { type: Sequelize.STRING},
    app: { type: Sequelize.STRING},
    appId : { type: Sequelize.STRING},
    dtmfNo: { type: Sequelize.INTEGER},
    user_id: { type: Sequelize.INTEGER},
    forward_outgoing : { type: Sequelize.INTEGER},
    connect_channel:{ type: Sequelize.STRING},
    source_channel:{ type: Sequelize.STRING},
    holded_time: { type: Sequelize.BIGINT },
    total_hold_time: { type: Sequelize.INTEGER },
    new_portal: { type: Sequelize.TINYINT, defaultValue: 1 },
},{
	tableName:"livecalls",
    timestamps: false,
} );

module.exports = livecalls;

// const mongoose = require('mongoose');
// var Schema = mongoose.Schema;
// var currentDate = new Date();
// var decreasedTime = currentDate.getTime() ;
// let ObjectId = require('mongodb').ObjectId;

// const phonebookSchema ={
//     id_user: {
//         type: Number,
//         required: true,
//         index: true
//     },
//     id_department: {
//         type: Number,
//         required: true,
//         index: true
//     },
//     time: {
// 		type: Date,
// 		default: decreasedTime
// 	},
//     answeredTime: {
// 		type: Date,
//          default: "",
// 	},
//     source: {
//         type: String,
//         default: "",
//         index: true
//     },
//     sourceName: {
//         type: String,
//         default: "",
//         index: true
//     },
//     destination: {
//         type: String,
//         default: "",
//         index: true
//     },
//     type: {
//         type: String,
//         default: "",
//         index: true
//     },
//     livekey: {
//         type: String,
//         default: "",
//         index: true
//     },
//     extension : {
//         type: String,
//         default: "",
//         index: true
//     },
//     answeredAgentName : {
//         type: String,
//         default: "",
//         index: true
//     },
//     id_ext : {
//         type: Number,
//         default: "",
//         index: true
//     },
//     currentStatus : {
//         type: Number,
//         default: "",
//         index: true
//     },
//     barge_code : {
//         type: String,
//         default: "",
//         index: true
//     },
//     channel : {
//         type: String,
//         default: "",
//         index: true
//     },
//     uniqueId : {
//         type: String,
//         default: "",
//         index: true
//     },
//     app : {
//         type: String,
//         default: "",
//         index: true
//     },
//     appId : {
//         type: String,
//         default: "",
//         index: true
//     },
//     dtmfNo : {
//         type: Number,
//         default: "",
//         index: true
//     },
//     user_id : {
//         type: Number,
//         default: "",
//         index: true
//     },
//     forward_outgoing: {
//         type: Number,
//         default: "",
//         index: true
// 	},
// }
// module.exports = mongoose.model('livecalls', new Schema(phonebookSchema, { strict: false} ));