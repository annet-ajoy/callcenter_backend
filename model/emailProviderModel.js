const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const emailSchema ={
  name: { type: String, required: false },
  createdAt: {
    type: Date,
    default: Date.now,
},

    updatedAt: {
        type: Date
    },
}
module.exports = mongoose.model('email_integration', new Schema(emailSchema, { strict: false} ));