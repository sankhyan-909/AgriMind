const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    crop: { type: String, required: true, trim: true },
    category: { type: String, default: "Vegetable" },
    produced: { type: Number, required: true, min: 0 },
    stored: { type: Number, required: true, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: "kg" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
