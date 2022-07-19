const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const sentEmail = require('../utils/mailer');

function tokenSign(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
}

function createToken(user, _statusCode, res) {
  const token = tokenSign(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.ENVIRONMENT === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
}

exports.signup = catchAsync(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
    passwordChangeAt: req.body.passwordChangeAt,
    role: req.body.role,
  });

  createToken(user, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(`email and password are required`, 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkCorrectPassword(password, user.password))) {
    return next(new AppError(`email or password incorrect`, 401));
  }

  createToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('email is not valid'), 404);
  }

  const resetToken = user.createPasswordResetToken();
  user.save({ validateModifiedOnly: true });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/user/reset-password/${resetToken}`;

  const message = `Submit a Patch with you new password ${resetUrl}.`;

  try {
    await sentEmail({
      email: req.body.email,
      subject: 'your new password reset token',
      text: message,
    });

    res.status(200).send({
      status: 'success',
      message: 'Token send to your email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordTokenExpiration = undefined;

    user.save({ validateModifiedOnly: true });

    return next(new AppError('send email failed', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is incorrect or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirmation;

  user.passwordResetToken = undefined;
  user.passwordTokenExpiration = undefined;

  await user.save({});


  createToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(new AppError('User is not found', 400));
  }

  const { currentPassword, password, passwordConfirmation } = req.body;

  if (!(await user.checkCorrectPassword(currentPassword, user.password))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  user.password = password;
  user.passwordConfirmation = passwordConfirmation;

  await user.save({ validateModifiedOnly: true });

  createToken(user, 200, res);
});
