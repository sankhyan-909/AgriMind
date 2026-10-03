const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "Vegetable" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "kg" },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Out of Stock", "Inactive"],
      default: "Active"
    },
    emoji: { type: String, default: "🌱" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
