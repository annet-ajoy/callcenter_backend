const { ApiError } = require("../../utils/autox/ApiError.js");
const { asyncHandler } = require("../../utils/autox/asyncHandler.js");
const { cryptoDecode, cryptoDecodeAutoxToken } = require("../../utils/autox/helpers.js");
const AutoxTokenModel = require("../../model/autoxToken.js");

const isAuthenticated = asyncHandler(async (req, res, next) => {
  var token = req["headers"].token;
  if (!token) {
    throw new ApiError(401, "Unauthorized request: No token provided");
  }

  const tokenStringData = cryptoDecode(token);
  if(!tokenStringData) {
    throw new ApiError(401, "Unauthorized request: Invalid token");
  }

  const tokenData = JSON.parse(tokenStringData);

  req.token = tokenData;
  return next();
});

const verifyAutoxToken = asyncHandler(async (req, res, next) => {
  var token = req["headers"].token;
  if (!token) {
    throw new ApiError(401, "Unauthorized request: No token provided");
  }
  
  const tokenStringData = cryptoDecodeAutoxToken(token);
  if(!tokenStringData) {
    throw new ApiError(401, "Unauthorized request: Invalid token");
  }
  const tokenData = JSON.parse(tokenStringData);

  const tokenFromDb = await AutoxTokenModel.findOne({ id_user: tokenData.id_user, id_department: tokenData.id_department  }, "token");
  if(token !== tokenFromDb?.token) {
    throw new ApiError(401, "Expired token");
  }

  req.token = {...tokenData, autoxToken: true};
  
  return next();
});

module.exports = { isAuthenticated, verifyAutoxToken };
