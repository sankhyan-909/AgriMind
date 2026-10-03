const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "Other" },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    crop: { type: String, default: "" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
