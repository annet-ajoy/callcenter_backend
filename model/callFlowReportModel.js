const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const callFlowReportSchema = new Schema({
  call_flow_id: {
    type: Number,
    index: true
  },
  call_flow_module: {
    type: String,
    index: true
  },
  module_id: {
    type: Number,
    index: true
  },
  start_time: {
    type: String,
    index: true
  },
  end_time: {
    type: String,
    index: true
  },
  source_number: {
    type: Number,
    index: true
  },
  id_user: {
    type: Number,
    index: true
  },
  id_department: {
    type: Number,
    index: true
  },
  did_number: {
    type: Number,
    index: true
  },
  call_unique_id: {
    type: String,
    index: true
  }
}, { strict: false });

module.exports = mongoose.model('callFlowReport', callFlowReportSchema);

