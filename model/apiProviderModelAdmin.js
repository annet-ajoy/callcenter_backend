const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const smsSchema = new Schema({
    template_id: {
        type: String,
        default: "",
        index: true
    },
    provider_name: {
        type: String,
        default: "",
        index: true
    },
    sender_id: {
        type: String,
        default: "",
        index: true
    },
    name: {
        type: String,
        default: "",
        index: true
    },
    message: {
        type: String,
        default: "",
        index: true
    },
    provider: {
        type: String,
        default: 'Voxbay'
    },
    id_user: {
        type: Number,
        default: "",
        index: true
    },
    id_department: {
        type: Number,
        default: "",
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now // Set default value to current date/time
    },
    updatedAt: {
        type: Date,
        default: null // Optionally track update time
    }
}, { strict: false });

module.exports = mongoose.model('api_templates', smsSchema);
