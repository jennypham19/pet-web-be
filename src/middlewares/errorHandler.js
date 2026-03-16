// src/middlewares/errorHandler.js
const { StatusCodes } = require('http-status-codes');
const config = require('../config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!(err instanceof ApiError)) { // Nếu không phải lỗi ApiError đã định nghĩa
    statusCode = statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    message = message || 'Internal Server Error';
    // Tạo một ApiError mới để log và response nhất quán
    // Không nên expose lỗi hệ thống chi tiết ra client ở production
    err = new ApiError(statusCode, message, false, config.env === 'development' ? err.stack : undefined);
  }

  const response = {
    success: false,
    message: err.message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  } else {
    // Chỉ log lỗi isOperational = false (lỗi hệ thống) ở production
    if (!err.isOperational) {
        logger.error(err);
    }
  }

  res.status(err.statusCode).send(response);
};

module.exports = errorHandler;