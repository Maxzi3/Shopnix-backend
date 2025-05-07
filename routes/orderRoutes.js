const express = require("express");
const {
  createOrder,
  getUserOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
} = require("../controllers/orderController");

const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

//  User creates a new order
router.post("/", createOrder);

//  Get orders belonging to the logged-in user
router.get("/my-orders", getUserOrders);

// Cancel an order (by user)
router.patch("/:id/cancel", cancelOrder);

//  Get all orders (admin only)
router.get("/", restrictTo("admin"), getAllOrders);

//  Get single order (user or admin)
//  Admin can update status or delete the order
router
  .route("/:id")
  .get(getSingleOrder)
  .patch(restrictTo("admin"), updateOrderStatus)
  .delete(restrictTo("admin"), deleteOrder); 

module.exports = router;
