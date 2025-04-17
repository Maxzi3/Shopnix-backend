const User = require("./../models/userModel");
const catchAsyncError = require("./../utils/catchAsyncError");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
const updateMe = catchAsyncError(async (req, res, next) => {
  // 1) Prevent password updates through this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }
  // 2) Filter unwanted fields that shouldn't be updated
  const filteredBody = filterObj(
    req.body,
    "fullName",
    "email",
    "address",
    "phoneNumber",
    "avatar"
  );
  // 3) Update the user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // Return updated user
    runValidators: true, // Validate new data
  });
  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }
  // 4) Send response with updated user
  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});

const deleteMe = catchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  res.status(204).json({ status: "success", message: "User deleted" });
});
const createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined please use /signup instead",
  });
};
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);
const getUser = factory.getOne(User);
const getAllUsers = factory.getAll(User);

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
  updateMe,
  deleteMe,
  getMe,
};
