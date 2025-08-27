const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const crmLogsTicketSchema = new Schema({
    added_by: {
        type: String,
        required: false
    },
    added_by_id: {
        type: String,
        required: false
    },
    crm_template_id: {
        type: Schema.Types.ObjectId,
        required: false,
    },
    action: {
        type: String,
        required: false
    },
    status:{
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

module.exports = mongoose.model('autoX_crm_Logs_Ticket', crmLogsTicketSchema);