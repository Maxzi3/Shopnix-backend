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
  verifyEmail,
  resendEmailVerification,
} = require("../controllers/authController");
const {
  protect,
  restrictTo,
  isLoggedIn,
} = require("../middlewares/authMiddleware");

//  User routes
const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendEmailVerification);
router.patch("/resetPassword/:token", resetPassword);
router.get("/check-auth", isLoggedIn, (req, res) => {
  if (!req.locals?.user) {
    return res.status(200).json({ isAuthenticated: false, user: null });
  }

  res.status(200).json({
    isAuthenticated: true,
    user: {
      name: req.locals.user.fullName,
      email: req.locals.user.email,
      avatar: req.locals.user.avatar,
    },
  });
});


// Protect all Route After this Middleware
router.use(protect);

router.patch("/updateMyPassword", updatePassword);
router.get("/me", getMe, getUser);
router.patch("/updateMe", uploadUserPhoto, updateMe);
router.delete("/deleteMe", deleteMe);

router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
