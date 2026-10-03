const mongoose = require("mongoose");

const irrigationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    crop: { type: String, required: true },
    irrigationDate: { type: String, required: true },
    waterSource: { type: String, default: "Tube Well" },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "litres" },
    method: { type: String, default: "Drip Irrigation" },
    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Irrigation", irrigationSchema);
