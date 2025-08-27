const mongoose = require('mongoose');
const { Schema } = mongoose;

const dataFormSchema = new Schema({
  templateId: {
    type: String,
    required: true
  },
   sms: {
    type: String,
    default:0
  },
    whatsapp: {
    type: String,
    default:0
  },
    api: {
    type: String,
    default:0
  },
    email: {
    type: String,
    default:0
  }
}, { strict: false });

module.exports = mongoose.model('dataform_settings', dataFormSchema);
