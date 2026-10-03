const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    source: { type: String, default: "Crop Sale" },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    crop: { type: String, default: "" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Income", incomeSchema);
