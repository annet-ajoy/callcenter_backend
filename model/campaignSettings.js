const Sequelize = require( "sequelize" );
const db = require( "../database" ).db;
const campaign_settings = db.define( "campaign_settings", {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_department: { type: Sequelize.INTEGER},
    campaign_id: { type: Sequelize.INTEGER, validate:{ notEmpty: true }},
    view_call_summary: { type: Sequelize.INTEGER},
    hang_up_on_submit: { type: Sequelize.INTEGER},
    retry_skip: { type: Sequelize.INTEGER},
    phn_number_mask: { type: Sequelize.INTEGER},
    remarks_skip: { type: Sequelize.INTEGER},
    whatsapp_integration: { type: Sequelize.INTEGER},
    api_integration: { type: Sequelize.INTEGER},
    template_id: { type: Sequelize.STRING},
    url: { type: Sequelize.STRING}, 
    msisdn: { type: Sequelize.STRING},
    token: { type: Sequelize.STRING},
    method: { type: Sequelize.STRING},
    jwt_token_url: { type: Sequelize.STRING},
    jwt_response: { type: Sequelize.STRING},
    jwt_method: { type: Sequelize.STRING}
},{
	tableName:"campaign_settings"
} );

module.exports = campaign_settings;