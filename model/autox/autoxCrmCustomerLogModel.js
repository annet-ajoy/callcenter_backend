const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const crmLogsAgentSchema = new Schema({
    crm_template_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    agent_name: {
        type: String,
        required: false
    },
    agent_id: {
        type: String,
        required: false
    },
    action: {
        type: String,
        required: false
    },
    cr_file: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

module.exports = mongoose.model('autoX_crm_Logs_agent', crmLogsAgentSchema);