const Product = require("./../models/productModel");
const factory = require("./handlerFactory");
const mongoose = require("mongoose");
const catchAsyncError = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");

const getProductByIdOrSlug = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let query;

  if (mongoose.Types.ObjectId.isValid(id)) {
    query = Product.findById(id);
  } else {
    query = Product.findOne({ slug: id });
  }

  if (!query) return next(new AppError("Product not found", 404));

  const product = await query.populate({
    path: "reviews",
    populate: {
      path: "user",
      select: "fullName",
    },
  });

  if (!product) return next(new AppError("Product not found", 404));

  console.log(product.reviews); // Now you should see populated user with fullName

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
