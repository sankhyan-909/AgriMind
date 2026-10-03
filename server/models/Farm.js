const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    area: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "Acres" },
    soilType: { type: String, default: "" },
    irrigation: { type: String, default: "" },
    crops: { type: [String], default: [] },
    status: { type: String, default: "Active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farm", farmSchema);
