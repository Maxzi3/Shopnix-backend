const APIFeatures = require("../utils/apiFeatures");
const catchAsyncError = require("../utils/catchAsyncError");
const Review = require("./../models/reviewModel");
const factory = require("./handlerFactory");

const setProductUserIds = (req, res, next) => {
  // Allow nested route
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
const getUserReview = catchAsyncError(async (req, res, next) => {
  const features = new APIFeatures(
    Review.find({ user: req.user.id })
      .populate("product", "name") // populate only the product's name
      .select("review rating product createdAt"), // only pick these fields from Review,
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const userReviews = await features.query;

  res.status(200).json({
    status: "success",
    results: userReviews.length,
    data: userReviews,
  });
});

const createReview = factory.createOne(Review);
const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);
const getReview = factory.getOne(Review, { path: "user", select: "fullName" });
const getAllReviews = factory.getAll(Review);

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
  getUserReview,
  setProductUserIds,
};
