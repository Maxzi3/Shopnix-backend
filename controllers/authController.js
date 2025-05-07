const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
  });
};


const signUp = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role || "user", // default role is user
  });

  // Send welcome email
  const welcomeUrl = `${process.env.FRONTEND_URL}`;
  await new Email(newUser, welcomeUrl).sendWelcome();

  // Send verification email
  const verificationToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  await new Email(newUser, verificationUrl).sendEmailVerification();

  createSendToken(newUser, 201, res);
});

const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // Send verification email if not verified
  // if (user.emailVerified === "pending") {
  //   const verificationToken = user.createEmailVerificationToken();
  //   await user.save({ validateBeforeSave: false });
  //   const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  //   await new Email(user, verificationUrl).sendEmailVerification();
  // }

  // 3)if everything is okay, generate a token and send to client
  createSendToken(user, 200, res);
});

const logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpsOnly: true,
  });
  res.status(200).json({ status: "success" });
};

const forgotPassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("No user found with that email", 404));
  }

  // 2) Generate password reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await new Email(user, resetUrl).sendPasswordReset();
    res.status(200).json({
      status: "success",
      message: "Password reset link sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

const resetPassword = catchAsyncError(async (req, res, next) => {
  // 1)Get user based on the token
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });

  // 2)If token has not expired and there is a user  Set the new password
  if (!user) {
    return next(new AppError("Token is Invalid or expired", 404));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  // 4) Login the user using the new password
  createSendToken(user, 200, res);
});

const updatePassword = catchAsyncError(async (req, res, next) => {
  // 1 Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2 check if posted current user is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your password is wrong.", 401));
  }

  // 3 if so  update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4  log user in , send jwt
  createSendToken(user, 200, res);
});

const verifyEmail = catchAsyncError(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.emailVerified = "verified";
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Email verified successfully",
  });
});

module.exports = {
  signUp,
  login,
  logout,
  resetPassword,
  forgotPassword,
  updatePassword,
  verifyEmail,
};
