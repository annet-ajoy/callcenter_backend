const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const fileSchema = new Schema({
    lead_id:{ type: mongoose.Schema.Types.ObjectId},
    filename: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

module.exports = mongoose.model('lead_attachment_file', fileSchema);


