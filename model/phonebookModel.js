// const Sequelize = require( "sequelize" );
// const db = require( "../database" ).db;
// const phonebook = db.define( "phonebook", {
// 	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
//     pbname: { type: Sequelize.STRING, validate:{ notEmpty: true }},
//     description: { type: Sequelize.STRING},
//     contact_count: { type: Sequelize.INTEGER},
//     id_user: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
//     id_department: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
//     phonebook_duplicate_check: { type: Sequelize.INTEGER},
//     date: { type: Sequelize.DATE, validate:{ notEmpty: true }}
// },{
// 	tableName:"phonebook"
// } );

// module.exports = phonebook;

const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;
var currentDate = new Date();
var decreasedTime = currentDate.getTime() ;
var Schema = mongoose.Schema;
const phonebookSchema ={
    pbname: {
        type: String,
        required: false,
        index: true
    },
    description: {
        type: String,
        required: false,
        index: true
    },
    contact_count: {
        type: Number,
        required: false,
        index: true,
        default: 0
    },
    date: {
        type: Date,
       default: ""
    },
    id_user: {
        type: Number,
        required: true,
        index: true
    },
    id_department: {
        type: Number,
        required: true,
        index: true
    },
    createdAt: {
		type: Date,
		default: currentDate
	},
    updatedAt: {
		type: Date
	},
}
module.exports = mongoose.model('phonebook', new Schema(phonebookSchema, { strict: false} ));