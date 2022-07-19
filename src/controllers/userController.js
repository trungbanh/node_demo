const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { filterData } = require('../utils/filter');

const { getOne, updateOne, getList } = require('./handlerFactory');

exports.setUserId = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.filterUpdateData = (req, res, next) => {
  req.body = filterData(req.body, 'name', 'email');
  next();
};

exports.verifyPassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.checkCorrectPassword(req.body.password, user.password))) {
    return next(new AppError('password is incorrect', 400));
  }

  next();
};

exports.getAllUser = getList(User);
exports.getMe = getOne(User);
exports.updateUser = updateOne(User);

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { active: false });

  res.status(204).json({
    status: 'success',
  });
});
