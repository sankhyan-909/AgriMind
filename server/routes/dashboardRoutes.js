const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { farmerDashboard, buyerDashboard } = require("../controllers/dashboardController");
const router = express.Router();
router.get("/farmer", protect, authorize("farmer"), farmerDashboard);
router.get("/buyer", protect, authorize("buyer"), buyerDashboard);
module.exports = router;
