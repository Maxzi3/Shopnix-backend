const multer = require("multer");
const Product = require("./../models/productModel");
const catchAsyncError = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");
const mongoose = require("mongoose");
const { resizeImage, uploadToCloudinary } = require("../cloudinary");



const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadProductImages = upload.fields([
  { name: "imageUrl", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

const getProductByIdOrSlug = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let query;
  if (mongoose.Types.ObjectId.isValid(id)) {
    query = Product.findById(id);
  } else {
    query = Product.findOne({ slug: id });
  }

  const product = await query.populate({
    path: "reviews",
    populate: {
      path: "user",
      select: "fullName",
    },
  });

  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    status: "success",
    data: product,
  });
});

const createProduct = catchAsyncError(async (req, res, next) => {
  // Filter allowed fields
  const filteredBody = filterObj(
    req.body,
    "name",
    "description",
    "price",
    "priceDiscount",
    "category",
    "stockNo"
  );

  // Handle image uploads
  if (req.files) {
    // Process cover image (imageUrl)
    if (req.files.imageUrl && req.files.imageUrl[0]) {
      const resizedBuffer = await resizeImage(req.files.imageUrl[0].buffer);
      const uploadResult = await uploadToCloudinary(
        resizedBuffer,
        `product-cover-${Date.now()}`,
        "products"
      );
      filteredBody.imageUrl = uploadResult.secure_url;
    }

    // Process additional images
    if (req.files.images && req.files.images.length > 0) {
      const imageUrls = [];
      for (const image of req.files.images) {
        const resizedBuffer = await resizeImage(image.buffer);
        const uploadResult = await uploadToCloudinary(
          resizedBuffer,
          `product-image-${Date.now()}`,
          "products"
        );
        imageUrls.push(uploadResult.secure_url);
      }
      filteredBody.images = imageUrls;
    }
  }

  // Create product
  const newProduct = await Product.create(filteredBody);

  res.status(201).json({
    status: "success",
    data: { product: newProduct },
  });
});

const updateProduct = catchAsyncError(async (req, res, next) => {
  // Filter allowed fields
  const filteredBody = filterObj(
    req.body,
    "name",
    "description",
    "price",
    "priceDiscount",
    "category",
    "stockNo"
  );

  // Handle image uploads
  if (req.files) {
    // Process cover image (imageUrl)
    if (req.files.imageUrl && req.files.imageUrl[0]) {
      const resizedBuffer = await resizeImage(req.files.imageUrl[0].buffer);
      const uploadResult = await uploadToCloudinary(
        resizedBuffer,
        `product-cover-${Date.now()}`,
        "products"
      );
      filteredBody.imageUrl = uploadResult.secure_url;
    }

    // Process additional images
    if (req.files.images && req.files.images.length > 0) {
      const imageUrls = [];
      for (const image of req.files.images) {
        const resizedBuffer = await resizeImage(image.buffer);
        const uploadResult = await uploadToCloudinary(
          resizedBuffer,
          `product-image-${Date.now()}`,
          "products"
        );
        imageUrls.push(uploadResult.secure_url);
      }
      filteredBody.images = imageUrls;
    }
  }

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedProduct) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { product: updatedProduct },
  });
});

const getAllProducts = factory.getAll(Product);
const deleteProduct = factory.deleteOne(Product);

module.exports = {
  getAllProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
};
