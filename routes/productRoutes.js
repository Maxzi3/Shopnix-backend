const express = require("express");
const {
  getAllProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
} = require("../controllers/productController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const reviewRouter = require("./../routes/reviewRoutes");

// Product routes
const router = express.Router();

router.use("/:productId/reviews", reviewRouter);

router
  .route("/")
  .get(getAllProducts)
  .post(protect, restrictTo("admin"), uploadProductImages, createProduct);

  
router
  .route("/:id")
  .get(getProductByIdOrSlug)
  .patch(protect, restrictTo("admin"),  uploadProductImages, updateProduct)
  .delete(protect, restrictTo("admin"), deleteProduct);
  


module.exports = router;
