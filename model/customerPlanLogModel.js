const Sequelize = require("sequelize");
const db = require("../database").db;

const customer_license = db.define(
  "customer_plan_log",
  {
    id_user: { type: Sequelize.INTEGER },
    ticket_management: { type: Sequelize.INTEGER },
    lead_management: { type: Sequelize.INTEGER },
    callcenter: { type: Sequelize.INTEGER },
    smartvoice: { type: Sequelize.STRING },
    ticket_management_agent_count: { type: Sequelize.INTEGER },
    lead_management_agent_count: { type: Sequelize.INTEGER },
    callcenter_agent_count: { type: Sequelize.INTEGER },
    smartvoice_agent_count: { type: Sequelize.INTEGER },
    total_users: { type: Sequelize.INTEGER },
    createdAt:  { type: Sequelize.DATE},
    expiring_date:  { type: Sequelize.DATE},
    additional_ticket_management_agent_count: { type: Sequelize.INTEGER },
    additional_lead_management_agent_count: { type: Sequelize.INTEGER },
    additional_callcenter_agent_count: { type: Sequelize.INTEGER },
    additional_smartvoice_agent_count: { type: Sequelize.INTEGER },
    additional_channel: { type: Sequelize.INTEGER },
    virtual_number: { type: Sequelize.INTEGER },
    virtual_purchase:  { type: Sequelize.INTEGER },
    payment_type: { type: Sequelize.STRING },
    transaction_id: { type: Sequelize.STRING },
    amount_with_gst:  { type: Sequelize.STRING },
    billing_type:  { type: Sequelize.INTEGER },
    discount_amount:  { type: Sequelize.INTEGER },
    voice_price:  { type: Sequelize.INTEGER },
    sms_price:  { type: Sequelize.INTEGER },
    did_plan_change_price: {type: Sequelize.STRING },
    replacement_price: {type: Sequelize.STRING}
  },
  {
    tableName: "customer_plan_log",
    timestamps: false,
  }
)

module.exports = customer_license