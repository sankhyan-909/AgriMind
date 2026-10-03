const Review = require("../models/Review");

async function listReviews(req, res) {
  const filter = {};

  if (req.query.productId) {
    filter.productId = req.query.productId;
  }

  if (req.user) {
    filter.buyer = req.user.id;
  }

  const reviews = await Review.find(filter)
    .populate("buyer", "name")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: reviews.length,
    data: reviews
  });
}

async function createReview(req, res) {
  const {
    product,
    productId,
    rating,
    comment
  } = req.body;

  if (
    !product ||
    !comment ||
    Number(rating) < 1 ||
    Number(rating) > 5
  ) {
    return res.status(400).json({
      success: false,
      message: "Product, rating and comment are required."
    });
  }

  const review = await Review.create({
    buyer: req.user.id,
    product,
    productId,
    rating: Number(rating),
    comment: comment.trim()
  });

  res.status(201).json({
    success: true,
    message: "Review submitted successfully.",
    data: review
  });
}

async function updateReview(req, res) {
  const review = await Review.findOneAndUpdate(
    {
      _id: req.params.id,
      buyer: req.user.id
    },
    {
      $set: req.body
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found."
    });
  }

  res.json({
    success: true,
    data: review
  });
}

async function deleteReview(req, res) {
  const review =
    await Review.findOneAndDelete({
      _id: req.params.id,
      buyer: req.user.id
    });

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found."
    });
  }

  res.json({
    success: true,
    message: "Review deleted successfully."
  });
}

module.exports = {
  listReviews,
  createReview,
  updateReview,
  deleteReview
};
