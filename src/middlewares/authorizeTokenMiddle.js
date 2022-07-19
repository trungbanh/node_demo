const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

exports.protectRouter = catchAsync(async (req, res, next) => {
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('user not login', 401));
  }

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(new AppError('user not exist', 401));
  }

  const test = currentUser.changedPasswordAfter(decode.iat);

  if (test) {
    return next(
      new AppError(
        'the password has already been changed, please login again',
        401
      )
    );
  }

  req.user = currentUser;
  next();
});

exports.retrickTo =
  (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(new AppError('you not have permission', 403));
      }
      next();
    };
