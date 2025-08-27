const { ApiError } = require("../../utils/autox/ApiError.js");
const { removeUnusedMulterImageFilesOnError } = require("../../utils/autox/helpers.js");

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Check if the error is an instance of an ApiError class which extends native Error class
  if (!(error instanceof ApiError)) {
    console.log("------error handler middleware--------", err);
    // if not
    // create a new ApiError instance to keep the consistency

    const statusCode = error.statusCode || 500;

    // set a message from native Error instance or a custom one
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || []);
  }

  // Now we are sure that the `error` variable will be an instance of ApiError class
  const response = {
    ...error,
    message: error.message,
    ...(process.env.PRODUCTION === "development" ? { stack: error.stack } : {}), // Error stack traces should be visible in development for debugging
  };

  removeUnusedMulterImageFilesOnError(req);

  return res.status(error.statusCode).json(response);
};

module.exports = { errorHandler };
