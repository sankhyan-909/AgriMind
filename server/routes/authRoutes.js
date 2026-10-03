const express = require("express");

const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword
} = require("../controllers/authController");

const {
  protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);

module.exports = router;
