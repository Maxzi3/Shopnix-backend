const express = require("express");
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
} = require("../controllers/userController");
const {
  signUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require("../controllers/authController");

//  User routes
const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// Protect all Route After this Middleware
router.use(protect);

router.patch("/updateMyPassword", updatePassword);
router.get("/me", getMe, getUser);
router.patch("/updateMe", uploadUserPhoto,  updateMe);
router.delete("/deleteMe", deleteMe);

router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
