const Product = require("./../models/productModel");
const factory = require("./handlerFactory");
const mongoose = require("mongoose");
const catchAsyncError = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");

const getProductByIdOrSlug = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const populateOptions = { path: "reviews" };

  let product;

  if (mongoose.Types.ObjectId.isValid(id)) {
    product = await Product.findById(id).populate(populateOptions);
  }

  if (!product) {
    product = await Product.findOne({ slug: id }).populate(populateOptions);
  }

  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    status: "success",
    data: product,
  });
});


const getAllProducts = factory.getAll(Product);
const createProduct = factory.createOne(Product);
const updateProduct = factory.updateOne(Product);
const deleteProduct = factory.deleteOne(Product);

module.exports = {
  getAllProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
