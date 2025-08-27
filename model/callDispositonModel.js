const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const callDispositionSchema = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    unique_id: {
      type: String,
      required: true,
    },
    disposition: {
      type: Schema.Types.ObjectId,
      ref: "call_task_disposition",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("call_disposition", callDispositionSchema);
