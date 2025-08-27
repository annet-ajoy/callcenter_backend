const Sequelize = require('sequelize');
const db = require('../database').db;

const breaks = db.define('breaks', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.STRING
    },
    id_user: {
        type: Sequelize.INTEGER
    },
    id_department: {
        type: Sequelize.INTEGER
    },
    break_type: {
        type: Sequelize.INTEGER
    },
    status: {
        type: Sequelize.INTEGER
    },
    maxDuration: {
        type: Sequelize.INTEGER
    },
    allow_outgoing: {
        type: Sequelize.INTEGER
    },
    allow_incoming: {
        type: Sequelize.INTEGER
    }
}, {
    tableName: 'breaks',
    timestamps: false, // Disable timestamps
});

module.exports = breaks;

