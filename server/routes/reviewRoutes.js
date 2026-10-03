const express = require("express");

const {
  listReviews,
  createReview,
  updateReview,
  deleteReview
} = require("../controllers/reviewController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("buyer"),
  listReviews
);

router.post(
  "/",
  protect,
  authorize("buyer"),
  createReview
);

router.put(
  "/:id",
  protect,
  authorize("buyer"),
  updateReview
);

router.delete(
  "/:id",
  protect,
  authorize("buyer"),
  deleteReview
);

module.exports = router;
