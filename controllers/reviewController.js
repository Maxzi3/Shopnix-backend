const Review = require("./../models/reviewModel");
const factory = require("./handlerFactory");

const setProductUserIds = (req, res, next) => {
  // Allow nested route
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

const createReview = factory.createOne(Review);
const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);
const getReview = factory.getOne(Review);
const getAllReviews = factory.getAll(Review);

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
  setProductUserIds,
};
