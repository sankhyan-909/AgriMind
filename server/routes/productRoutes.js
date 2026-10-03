const express = require("express");

const {
  listProducts,
  getProduct,
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public marketplace
router.get("/", listProducts);
router.get("/my-products", protect, authorize("farmer"), listMyProducts);
router.get("/:id", getProduct);

// Farmer management
router.post("/", protect, authorize("farmer"), createProduct);
router.put("/:id", protect, authorize("farmer"), updateProduct);
router.delete("/:id", protect, authorize("farmer"), deleteProduct);

module.exports = router;
