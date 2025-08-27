const Sequelize = require("sequelize");
const db = require("../database").db;

const customer_license = db.define(
  "customer_license",
  {
    id_user: { type: Sequelize.INTEGER },
    ticket_management: { type: Sequelize.INTEGER },
    lead_management: { type: Sequelize.INTEGER },
    callcenter: { type: Sequelize.INTEGER },
    smartvoice: { type: Sequelize.STRING },
    ticket_management_agent_count: { type: Sequelize.INTEGER },
    lead_management_agent_count: { type: Sequelize.INTEGER },
    callcenter_agent_count: { type: Sequelize.STRING },
    smartvoice_agent_count: { type: Sequelize.STRING },
    total_users: { type: Sequelize.INTEGER },
    createdAt:  { type: Sequelize.DATE},
    expiring_date:  { type: Sequelize.DATE},
  },
  {
    tableName: "customer_license",
    timestamps: false,
  }
)

module.exports = customer_license
