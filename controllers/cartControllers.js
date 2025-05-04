const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsyncError");

// Get User Cart
const getCart = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    "items.product",
    "name price priceDiscount imageUrl"
  );

  if (!cart) {
    return res.json({ status: "success", data: { cart: { items: [] } } });
  }

  res.json({ status: "success", data: { cart } });
});

// Add to Cart
const addToCart = catchAsyncError(async (req, res, next) => {
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
const updateCartItem = catchAsyncError(async (req, res, next) => {
  const { quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) return next(new AppError("Cart not found", 404));

  const item = cart.items.find(
    (item) => item._id.toString() === req.params.itemId
  );
  if (!item) return next(new AppError("Item not found in cart", 404));

  item.quantity = quantity;
  await cart.save();
  res.json({ status: "success", data: { cart } });
});

// Remove Item from Cart
const removeCartItem = catchAsyncError(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new AppError("Cart not found", 404));

  cart.items = cart.items.filter(
    (item) => item._id.toString() !== req.params.itemId
  );
  await cart.save();

  res.json({ status: "success", data: { cart } });
});

// Clear Cart
const clearCart = catchAsyncError(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  res.status(204).json({ status: "success", data: null });
});

const mergeGuestCart = async (req, res, next) => {
  try {
    console.log("mergeGuestCart started...");

    // 1. Check if user is authenticated
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    const userId = req.user.id;
    const guestItems = req.body.guestItems || [];

    console.log("Authenticated User ID:", userId);
    console.log("Guest Cart Items Received:", guestItems);

    // 2. Find the user's existing cart (if any)
    let userCart = await Cart.findOne({ user: userId });

    if (!userCart) {
      // If the user doesn't have a cart, create one
      userCart = new Cart({
        user: userId,
        items: [],
      });
    }

    // 3. Loop through guest cart items
    for (const item of guestItems) {
      // Extract product _id
      const productId = item.product._id; // Get the product's _id

      // Check if this product is already in the cart
      const existingItemIndex = userCart.items.findIndex(
        (i) => i.product.toString() === productId.toString()
      );

      if (existingItemIndex !== -1) {
        // If the product exists in the cart, update the quantity
        userCart.items[existingItemIndex].quantity += item.quantity;
      } else {
        // Else, add the product as a new item in the cart
        userCart.items.push({
          product: productId,
          quantity: item.quantity,
        });
      }
    }

    // 4. Save the updated cart
    await userCart.save();
    console.log("Updated cart:", userCart);

    // 5. Return the updated cart
    const updatedCart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );
    res.status(200).json({
      status: "success",
      message: "Guest cart merged successfully",
      data: {
        cart: updatedCart,
      },
    });
  } catch (error) {
    console.error("Error in mergeGuestCart:", error);
    next(error);
  }
};


module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
};
