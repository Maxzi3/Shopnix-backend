const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
  updateCartItemSize,
} = require("../controllers/cartControllers");
const { setProductUserIds } = require("../controllers/reviewController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();


router.use(protect);

router.post("/merge", mergeGuestCart);
router.patch("/update-size/:cartItemId", protect, updateCartItemSize);


router
  .route("/")
  .get(getCart)
  .post(restrictTo("user"), setProductUserIds, addToCart)
  .delete(clearCart);
router.route("/:itemId").patch(updateCartItem).delete(removeCartItem);
module.exports = router;
