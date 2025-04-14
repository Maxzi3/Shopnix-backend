const APIFeatures = require("./../utils/apiFeatures");
const catchAsyncError = require("./../utils/catchAsyncError");
const AppError = require("./../utils/appError");

const deleteOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res
      .status(204)
      .json({ status: "success", message: "Data deleted successfully" });
  });
const updateOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
const createOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: "success", data: doc });
  });
const getOne = (Model, popOptions) =>
  catchAsyncError(async (req, res, next) => {
    let query = await Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });
const getAll = (Model) =>
  catchAsyncError(async (req, res, next) => {
    // To allow for nested Get review on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const data = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: data.length,
      data,
    });
  });

module.exports = {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
};
