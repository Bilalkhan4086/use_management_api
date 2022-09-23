const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/user");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendCookieResponse } = require("./admin");
// logging in super admin by passing credentials

exports.loginClient = asyncHandler(async (req, res, next) => {
  if (!req.body.userName || !req.body.password) {
    return next(new ErrorHandler("User Name or Password Not Provided", 400));
  }
  const response = await User.findOne({ userName: req.body.userName }).select(
    "+password"
  );
  if (!response) {
    return next(new ErrorHandler("No user found with this User Name", 404));
  }
  if(response.role !== "client"){
    return next(
      new ErrorHandler("Client can only be login by this route", 400)
    );
  }
  if(response.status === "Disabled"){
    return next(
      new ErrorHandler("You are blocked by admin so cannot access this route", 400)
    );
  }
  const match = await response.matchPassword(req.body.password);
  if (!match) {
    return next(new ErrorHandler("Invalid Credentials", 404));
  }
  response.password = undefined;
  const refreshTokeh = response.signJWTRefreshToken();
  sendCookieResponse(response, res, 200 , refreshTokeh);
});

// getting admin details

exports.getClientDetails = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User Not Allowed", 400));
  }
  res.status(200).json({
    success: true,
    details: req.user,
  });
};
