const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    id: mongoose.Schema.Types.Mixed,
    name: String,
    price: Number,
    quantity: Number,
    unit: String,
    emoji: String,
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    customer: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String
    },
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 40 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "Placed",
        "New",
        "Processing",
        "Out for Delivery",
        "Delivered",
        "Completed",
        "Cancelled"
      ],
      default: "Placed"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },
    paymentMethod: {
      type: String,
      default: "Cash on Delivery"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
