const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["farmer", "buyer"],
      required: true
    },
    profile: {
      location: { type: String, default: "" },
      farmName: { type: String, default: "" },
      address: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
