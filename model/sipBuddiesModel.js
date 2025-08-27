const Sequelize = require("sequelize");
const db = require("../database").db4;

const sipBuddies = db.define("cc_sip_buddies", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING },
    id_cc_card: { type: Sequelize.STRING },
    accountcode: { type: Sequelize.STRING },
    regexten: { type: Sequelize.STRING },
    context: { type: Sequelize.STRING },
    host: { type: Sequelize.STRING },
    nat: { type: Sequelize.STRING },
    qualify: { type: Sequelize.STRING },
    secret: { type: Sequelize.STRING },
    username: { type: Sequelize.STRING },
    allow: { type: Sequelize.STRING },
    agent_type: { type: Sequelize.INTEGER },
}, {
    tableName: "cc_sip_buddies",
    timestamps: false, 
});

module.exports = sipBuddies;
