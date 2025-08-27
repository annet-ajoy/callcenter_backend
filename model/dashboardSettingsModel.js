const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const smsSchema = {
    ticket_graph_settings: {
        type: Object, 
        default: {},  
        required: true,
        index: true
    },
    id_user: {
        type: Number, 
        required: true,
        index: true
    }
};

module.exports = mongoose.model('dashboard_settings', new Schema(smsSchema, { strict: false }));
