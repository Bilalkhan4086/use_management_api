const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/user");
const ErrorHandler = require("../utils/ErrorHandler");

// sending cookie response to client side

exports.sendCookieResponse = (user, res, status) => {
  let token = user.signJWTToken();

  let options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIREE * 1000 * 60 * 60),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(status).cookie("token", token, options).json({
    role:user.role,
    success: true,
    token,
  });
};

// logging in super admin by passing credentials

exports.loginAdmin = asyncHandler(async (req, res, next) => {
  if (!req.body.userName || !req.body.password) {
    return next(new ErrorHandler("User Name or Password Not Provided", 400));
  }
  const response = await User.findOne({ userName: req.body.userName }).select(
    "+password"
  );
  if (!response) {
    return next(
      new ErrorHandler("No user found with this UserName or Password", 404)
    );
  }
  const match = await response.matchPassword(req.body.password);
  if (!match) {
    return next(new ErrorHandler("Invalid Credentials", 404));
  }
  response.password = undefined;
  this.sendCookieResponse(response, res, 200);
});

// getting admin details

exports.getAdminDetails = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User Not Allowed", 400));
  }
  res.status(200).json({
    success: true,
    details: req.user,
  });
};

// getting All users details

exports.getAllUserDetails = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User Not Allowed", 400));
  }
  const response = await User.find();
  res.status(200).json({
    success: true,
    count: response.length,
    users: response,
  });
});

// adding new client by passing details like username and password

exports.addNewClient = asyncHandler(async (req, res, next) => {
  const response = await User.create(req.body);
  this.sendCookieResponse(response, res, 200);
});
