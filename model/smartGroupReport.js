const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const smartGroupReportSchema = new Schema({
  type: {
    type: String,
    index: true
  },
  eventTime: {
    type: String,
    index: true
  },
  userId: {
    type: Number,
    index: true
  },
  eventStatus: {
    type: String,
    index: true
  },
  uniqueId: {
    type: String,
    index: true
  },
  callFlowId: {
    type: Number,
    index: true
  },
  customer_id: {
    type: Number,
    index: true
  },
  department_id: {
    type: Number,
    index: true
  },
  id_user: {
    type: Number,
    index: true
  },
  loop_count: {
    type: Number,
    index: true
  },
  smartgroup_id: {
    type: Number,
    index: true
  },
  status: {
    type: String,
    index: true
  }
}, { strict: false });

module.exports = mongoose.model('smartGroupReport', smartGroupReportSchema);
