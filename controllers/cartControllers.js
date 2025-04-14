const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsyncError");

// Get User Cart
exports.getCart = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    "items.product",
    "name price priceDiscount image"
  );
  if (!cart) return next(new AppError("Cart is empty", 404));
  res.json({ status: "success", data: { cart } });
});

// Add to Cart
exports.addToCart = catchAsyncError(async (req, res, next) => {
  const { productId, quantity } = req.body;
  console.log("Received productId:", productId); 
  const product = await Product.findById(productId);
  if (!product) return next(new AppError("Product not found", 404));

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  res.status(200).json({ status: "success", data: { cart } });
});

// Update Cart Item Quantity
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) return next(new AppError("Cart not found", 404));

    const item = cart.items.find((item) => item._id.toString() === req.params.itemId);
    if (!item) return next(new AppError("Item not found in cart", 404));

    item.quantity = quantity;
    await cart.save();
    res.json({ status: "success", data: { cart } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// Remove Item from Cart
exports.removeCartItem = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return next(new AppError("Cart not found", 404));

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );
    await cart.save();

    res.json({ status: "success", data: { cart } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// Clear Cart
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
