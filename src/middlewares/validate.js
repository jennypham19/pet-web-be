const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick'); // Chúng ta sẽ tạo file này ngay sau đây

const validate = (schema) => (req, res, next) => {
  // Tạo một object chứa các thuộc tính cần validate từ schema (ví dụ: body, params, query)
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));

  // Thực hiện validation
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  // Nếu có lỗi, tạo một ApiError và gửi đến global error handler
  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(StatusCodes.BAD_REQUEST, errorMessage));
  }

  // Nếu thành công, gán giá trị đã được validate (có thể đã được Joi chuẩn hóa) vào request
  Object.assign(req, value);
  return next();
};

module.exports = validate;