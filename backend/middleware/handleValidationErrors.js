const { validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors as an array of messages or with param info
    const extractedErrors = errors.array().map((err) => ({
      param: err.param,
      msg: err.msg,
    }));

    return res.status(400).json({
      errors: extractedErrors,
    });
  }
  next();
};

module.exports = handleValidationErrors;
