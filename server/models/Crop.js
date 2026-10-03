const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "Vegetable" },
    production: { type: Number, required: true, min: 0 },
    stored: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: "kg" },
    plantingDate: { type: String, default: "" },
    harvestDate: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);
