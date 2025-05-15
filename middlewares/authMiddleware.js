const User = require("../models/userModel");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");

const protect = catchAsyncError(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(
      new AppError("You are not Logged in! Please Log in to get access", 401)
    );

  // 2) Verfication of Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3)check if user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("User no longer exists.", 401));
  }

  // 4) Check if user change password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };

const isLoggedIn = catchAsyncError(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) return next();

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  if (!decoded) return next();

  const user = await User.findById(decoded.id);
  if (!user) return next();

  if (user.changePasswordAfter(decoded.iat)) return next();

  req.locals = req.locals || {};
  req.locals.user = user;

  next();
});

module.exports = {
  protect,
  restrictTo,
  isLoggedIn,
};
