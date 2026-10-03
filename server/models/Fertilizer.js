const mongoose = require("mongoose");

const fertilizerSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    crop: { type: String, required: true },
    fertilizerName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "kg" },
    applicationDate: { type: String, required: true },
    method: { type: String, default: "Soil Application" },
    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fertilizer", fertilizerSchema);
