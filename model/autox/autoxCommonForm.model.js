const mongoose = require("mongoose");
const { Schema } = mongoose;

const commonFormSchema = new Schema(
  {
    id_user: {
      type: Number,
      required: true,
      index: true,
    },
    id_department: {
      type: Number,
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    fields: {
      type: [
        new Schema(
          {
            name: { type: String, required: true },
            feildname: { type: String, required: true },
            field_type: { type: String, required: true },
            field_order: { type: Number, default: 1 },
            mandatory: { type: Boolean, default: false },
            filter: { type: Boolean, default: false },
          },
          { strict: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("autox_common_form", commonFormSchema);
