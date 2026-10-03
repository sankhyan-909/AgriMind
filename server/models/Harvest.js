const mongoose = require("mongoose");

const harvestSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    crop: { type: String, required: true },
    harvestDate: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "kg" },
    quality: { type: String, default: "Grade A" },
    storageInformation: { type: String, default: "" },
    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Harvest", harvestSchema);
