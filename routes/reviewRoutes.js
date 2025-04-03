const express = require("express");
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
  setProductUserIds,
} = require("../controllers/reviewController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

// Protect all Route After this Middleware
router.use(protect);

router
  .route("/")
  .get(getAllReviews)
  .post(restrictTo("user"), setProductUserIds, createReview);
router.route("/:id").get(getReview).patch(updateReview).delete(deleteReview);

module.exports = router;
