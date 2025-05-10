const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

exports.createOrder = async (req, res) => {
  const userId = req.user._id;

  // 1. Find user's cart
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty" });
  }

  // 2. Build orderItems
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    size: item.size,
  }));

  // 3. Calculate total price
  const totalPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 4. Fetch user to get default address
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 5. Set shippingAddress with default from user.address if not provided
  const shippingAddress = req.body.shippingAddress || user.address || "";

  // 6. Create order
  const order = await Order.create({
    user: userId,
    orderItems,
    shippingAddress,
    paymentMethod: req.body.paymentMethod || "Pay on delivery",
    totalPrice,
  });

  // 7. Clear cart
  await Cart.findOneAndDelete({ user: userId });

  res.status(201).json({ order });
};
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
};

exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "fullName email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only the owner or an admin can access it
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};
exports.getAllOrders = async (req, res) => {
  try {
    // Check role (optional: if you don't have a role guard middleware)
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to view all orders" });
    }

    const orders = await Order.find().populate("user", "fullName email");

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ message: "Please provide a status to update" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    if (status === "delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      status: "success",
      message: "Order status updated",
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(204).json({ status: "success", message: "Order deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete order" });
  }
};
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if current user owns the order
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // Prevent cancelling if already shipped or delivered
    const nonCancelableStatuses = ["shipped", "delivered", "cancelled"];
    if (nonCancelableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        message: `You cannot cancel an order that is already ${order.orderStatus}`,
      });
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = Date.now();
    await order.save();

    //   await sendEmail({
    //     to: process.env.ADMIN_EMAIL, // set this in .env
    //     subject: `Order Cancelled by User`,
    //     message: `
    //   A user just cancelled an order.

    //   Order ID: ${order._id}
    //   Cancelled By: ${req.user.name} (${req.user.email})
    //   Time: ${order.cancelledAt}

    //   Please review it in the admin dashboard.
    // `,
    //   });

    res.status(200).json({
      status: "success",
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};
