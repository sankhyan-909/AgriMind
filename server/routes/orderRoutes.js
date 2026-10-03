const express = require("express");

const {
  createOrder,
  listBuyerOrders,
  getBuyerOrder,
  cancelBuyerOrder,
  listFarmerOrders,
  updateFarmerOrderStatus
} = require("../controllers/orderController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("buyer"),
  createOrder
);

router.get(
  "/buyer",
  protect,
  authorize("buyer"),
  listBuyerOrders
);

router.get(
  "/buyer/:id",
  protect,
  authorize("buyer"),
  getBuyerOrder
);

router.put(
  "/buyer/:id/cancel",
  protect,
  authorize("buyer"),
  cancelBuyerOrder
);

router.get(
  "/farmer",
  protect,
  authorize("farmer"),
  listFarmerOrders
);

router.put(
  "/farmer/:id/status",
  protect,
  authorize("farmer"),
  updateFarmerOrderStatus
);

module.exports = router;
