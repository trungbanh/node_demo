const AppError = require('../utils/AppError');

function handleCastError(error) {
  const message = `Invalid ${error.path} in ${error.value}`;
  return new AppError(message, 400);
}

function handleDuplicateError(error) {
  const keys = Object.keys(error.keyPattern).join(', ');
  const values = Object.values(error.keyValue).join(', ');
  const message = `Duplicate fields {${keys}} by value {${values}}`;
  return new AppError(message, 400);
}

function handleValidationError(error) {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Input data ${errors.join('; ')}`;
  return new AppError(message, 400);
}

function handleJsonWebTokenError() {
  return new AppError('token is invalid', 401);
}

function handleTokenExpiredError() {
  return new AppError('token is expired', 401);
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let _error = { ...err };
  _error.message = err.message;
  _error.stack = err.stack;

  if (err.name === 'CastError') {
    _error = handleCastError(_error);
  }
  if (err.code === 11000) {
    _error = handleDuplicateError(_error);
  }
  if (err.name === 'ValidationError') {
    _error = handleValidationError(_error);
  }
  if (err.name === 'JsonWebTokenError') {
    _error = handleJsonWebTokenError(_error);
  }
  if (err.name === 'TokenExpiredError') {
    _error = handleTokenExpiredError(_error);
  }

  res.status(err.statusCode).json({
    status: _error.status,
    message: _error.message,
    stack: _error.stack,
    err: _error,
  });
};
