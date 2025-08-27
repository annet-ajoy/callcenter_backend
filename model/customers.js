const Sequelize = require("sequelize");
const db = require("../database").db;

const customers = db.define(
  "customers",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    sms_limit: { type: Sequelize.INTEGER },
    sms_balance: {type: Sequelize.INTEGER,defaultValue: 0},
    credit_limit: { type: Sequelize.INTEGER },
    number: { type: Sequelize.STRING },
    id_reseller: { type: Sequelize.INTEGER },
    date: { type: Sequelize.DATE },
    name: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING, validate: { notEmpty: true } },
    ext_prefix: { type: Sequelize.STRING },
    company_name: { type: Sequelize.STRING },
    contact_number: { type: Sequelize.STRING },
    website: { type: Sequelize.STRING },
    sms_uid: { type: Sequelize.STRING },
    sms_pin: { type: Sequelize.STRING },
    call_uid: { type: Sequelize.STRING },
    call_pin: { type: Sequelize.STRING },
    promo_credit: { type: Sequelize.INTEGER },
    promo_1creditsec: { type: Sequelize.INTEGER },
    promo_creditLimit: { type: Sequelize.INTEGER },
    balance: { type: Sequelize.INTEGER,defaultValue: 0},
    admin: { type: Sequelize.INTEGER },
    status: { type: Sequelize.INTEGER,comment: '0=disabled, 1=active, 2=demo, 3=demo expired'},
    member_type: { type: Sequelize.INTEGER },
    popup_data_count: { type: Sequelize.INTEGER },
    show_misscall_to_all_agents: { type: Sequelize.INTEGER },
    mobile_login_enabled: { type: Sequelize.INTEGER },
    logo: { type: Sequelize.STRING },
    kyc_verified : { type: Sequelize.INTEGER },
    isCompany : { type: Sequelize.INTEGER },
    new_portal:{ type: Sequelize.INTEGER },
    email_verified: { type: Sequelize.TINYINT, defaultValue: 1 },
    byot:{ type: Sequelize.INTEGER },
    hybrid_api_ip: { type: Sequelize.STRING },
    working_hours: { type: Sequelize.STRING, defaultValue: "00:00-24:00" },
    working_hours_filter: { type: Sequelize.TINYINT, defaultValue: 0, comment: "0 = disable, 1 = enabled" }
  },
  {
    tableName: "customers",
    timestamps: false,
  }
)

module.exports = customers
