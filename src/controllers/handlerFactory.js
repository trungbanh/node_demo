const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getFilterObj = ({ paramName, foreignField }, req) => {
  const pName = req.params?.[paramName];
  return pName ? { [foreignField]: pName } : {};
};

exports.getList = (Model, populateOptions, findOptions) =>
  catchAsync(async (req, res) => {

    let filterObj = {};

    if (typeof findOptions === 'object' && Object.keys(findOptions).length) {
      filterObj = getFilterObj(findOptions, req);
    }

    const features = new APIFeatures(Model.find(filterObj), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const { query } = features;

    if (populateOptions) {
      populateOptions.forEach((popOpt) => {
        query.populate(popOpt);
      });
    }

    const data = await query;

    res.status(200).json({
      status: 'success',
      timeRequestAt: res.timeRequest,
      results: data.length,
      data: {
        data,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);

    if (populateOptions) {
      populateOptions.forEach((popOpt) => {
        query.populate(popOpt);
      });
    }

    const model = await query;

    if (!model) {
      return next(new AppError(`Not found id :${req.params.id}`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: model,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError(`Not found id :${req.params.id}`, 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`Not found id :${req.params.id}`, 404));
    }
    res.status(204).json({
      status: 'success',
    });
  });
