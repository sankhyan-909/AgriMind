const Order = require("../models/Order");
const Product = require("../models/Product");

function createOrderNumber() {
  return `ORD-${Date.now().toString().slice(-8)}-${Math.floor(
    100 + Math.random() * 900
  )}`;
}

const ALLOWED_PAYMENT_METHODS = [
  "Cash on Delivery",
  "UPI / Online Payment",
];

const ALLOWED_STATUSES = [
  "New",
  "Processing",
  "Out for Delivery",
  "Delivered",
  "Completed",
  "Cancelled",
];

async function createOrder(req, res) {
  try {
    const {
      items,
      customer,
      paymentMethod = "Cash on Delivery",
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item.",
      });
    }

    if (!customer || typeof customer !== "object") {
      return res.status(400).json({
        success: false,
        message: "Delivery information is required.",
      });
    }

    const requiredCustomerFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredCustomerFields) {
      if (!String(customer[field] || "").trim()) {
        return res.status(400).json({
          success: false,
          message: `${field} is required.`,
        });
      }
    }

    if (!/^\d{10}$/.test(String(customer.phone).trim())) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain 10 digits.",
      });
    }

    if (!/^\d{6}$/.test(String(customer.pincode).trim())) {
      return res.status(400).json({
        success: false,
        message: "PIN code must contain 6 digits.",
      });
    }

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    const preparedItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message:
            "Every order item must reference a valid product.",
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a valid quantity.",
        });
      }

      const product = await Product.findOne({
        _id: item.productId,
        status: "Active",
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "One of the selected products is no longer available.",
        });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} does not have enough stock.`,
        });
      }

      subtotal += product.price * quantity;

      preparedItems.push({
        productId: product._id,
        id: product._id,
        name: product.name,
        price: product.price,
        quantity,
        unit: product.unit,
        emoji: product.emoji,
        farmerId: product.farmer,
      });
    }

    // The current order model stores one farmer per order.
    // Keep each checkout tied to one farmer so farmer-side
    // status updates remain correctly scoped.
    const farmerIds = [
      ...new Set(
        preparedItems.map((item) =>
          item.farmerId.toString()
        )
      ),
    ];

    if (farmerIds.length !== 1) {
      return res.status(400).json({
        success: false,
        message:
          "This checkout contains products from multiple farmers. Please place separate orders for each farmer.",
      });
    }

    const farmer = farmerIds[0];
    const deliveryCharge = 40;
    const total = subtotal + deliveryCharge;

    // Reserve stock atomically before creating the order.
    const reserved = [];

    try {
      for (const item of preparedItems) {
        const updated = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            status: "Active",
            quantity: { $gte: item.quantity },
          },
          {
            $inc: { quantity: -item.quantity },
          },
          {
            new: true,
          }
        );

        if (!updated) {
          throw new Error(
            `${item.name} is no longer available in the requested quantity.`
          );
        }

        reserved.push(item);
      }

      for (const item of preparedItems) {
        const product = await Product.findById(item.productId);

        if (product) {
          product.status =
            product.quantity > 0
              ? "Active"
              : "Out of Stock";

          await product.save();
        }
      }

      const order = await Order.create({
        orderNumber: createOrderNumber(),
        buyer: req.user.id,
        farmer,
        items: preparedItems,
        customer: {
          fullName: String(customer.fullName).trim(),
          phone: String(customer.phone).trim(),
          address: String(customer.address).trim(),
          city: String(customer.city).trim(),
          state: String(customer.state).trim(),
          pincode: String(customer.pincode).trim(),
        },
        subtotal,
        deliveryCharge,
        total,
        status: "Placed",
        paymentStatus:
          paymentMethod === "Cash on Delivery"
            ? "Pending"
            : "Paid",
        paymentMethod,
      });

      const populatedOrder =
        await Order.findById(order._id)
          .populate("buyer", "name email phone")
          .populate("farmer", "name email phone");

      return res.status(201).json({
        success: true,
        message: "Order placed successfully.",
        data: populatedOrder,
      });
    } catch (error) {
      // Return reserved stock if order creation fails.
      for (const item of reserved) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: { quantity: item.quantity },
          }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Unable to place order.",
    });
  }
}

async function listBuyerOrders(req, res) {
  const orders = await Order.find({
    buyer: req.user.id,
  })
    .populate("farmer", "name email phone")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
}

async function getBuyerOrder(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    buyer: req.user.id,
  })
    .populate("farmer", "name email phone")
    .populate("buyer", "name email phone");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  res.json({
    success: true,
    data: order,
  });
}

async function cancelBuyerOrder(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    buyer: req.user.id,
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  if (
    ["Delivered", "Completed", "Cancelled"].includes(
      order.status
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "This order cannot be cancelled.",
    });
  }

  order.status = "Cancelled";

  for (const item of order.items) {
    if (item.productId) {
      const product = await Product.findById(
        item.productId
      );

      if (product) {
        product.quantity += Number(item.quantity || 0);
        product.status =
          product.quantity > 0
            ? "Active"
            : "Out of Stock";

        await product.save();
      }
    }
  }

  await order.save();

  res.json({
    success: true,
    message: "Order cancelled successfully.",
    data: order,
  });
}

async function listFarmerOrders(req, res) {
  const orders = await Order.find({
    farmer: req.user.id,
  })
    .populate("buyer", "name email phone")
    .populate("farmer", "name email phone")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
}

async function updateFarmerOrderStatus(req, res) {
  const { status } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status.",
    });
  }

  const order = await Order.findOne({
    _id: req.params.id,
    farmer: req.user.id,
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  order.status = status;

  if (
    status === "Delivered" ||
    status === "Completed"
  ) {
    order.paymentStatus =
      order.paymentMethod === "Cash on Delivery"
        ? "Paid"
        : order.paymentStatus;
  }

  await order.save();

  res.json({
    success: true,
    message: "Order status updated successfully.",
    data: order,
  });
}

module.exports = {
  createOrder,
  listBuyerOrders,
  getBuyerOrder,
  cancelBuyerOrder,
  listFarmerOrders,
  updateFarmerOrderStatus,
};
