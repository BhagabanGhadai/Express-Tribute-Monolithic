const { validationResult } =require('express-validator');
const { errorHandler } =require('../middlewares/error.middleware');
const { ApiError } = require('../../utils/ApiError.js')

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  throw new ApiError(422, "Received data is not valid", extractedErrors);
};
