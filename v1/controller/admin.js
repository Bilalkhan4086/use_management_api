const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/user");
const fetch = require("node-fetch");
const ErrorHandler = require("../utils/ErrorHandler");
require("dotenv").config("../../.env");
// sending cookie response to client side

exports.sendCookieResponse = (user, res, status, refreshToken = null) => {
  let token = user.signJWTToken();

  let options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIREE * 1000 * 60 * 60),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  if (refreshToken === null) {
    res.status(status).json({
      role: user.role,
      success: true,
      token,
    });
  } else {
    res.status(status).json({
      role: user.role,
      success: true,
      token,
      refreshToken,
    });
  }
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
  if (response.role !== "admin") {
    return next(new ErrorHandler("Admin can only be login by this route", 400));
  }
  const match = await response.matchPassword(req.body.password);
  if (!match) {
    return next(new ErrorHandler("Invalid Credentials", 404));
  }
  response.password = undefined;
  const refreshTokeh = response.signJWTRefreshToken();
  this.sendCookieResponse(response, res, 200, refreshTokeh);
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
  const response = await User.find({ role: { $eq: "client" } }).sort({
    createdAt: -1,
  });
  res.status(200).json({
    success: true,
    count: response.length,
    users: response,
  });
});

// adding new client by passing details like username and password

exports.addNewClient = asyncHandler(async (req, res, next) => {
  await User.create(req.body);
  res.status(200).json({
    success: true,
  });
});

// changing client status

exports.changeClientStatus = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User Not Allowed", 400));
  }
  await User.findOneAndUpdate(
    { userName: req.body.userName },
    {
      $set: {
        status: req.body.status,
      },
    }
  );

  res.status(200).json({
    success: true,
  });
});

// getting long lasting access token for facebook business api

exports.getLongLastingToken = asyncHandler(async (req, res, next) => {
  let jsonres;
  try {
    const response = await fetch(
      `https://graph.facebook.com/v15.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.APP_ID}&client_secret=${process.env.APP_SECRET}&fb_exchange_token=${req.query.accessToken}`
    );
    jsonres = await response.json();
  } catch (err) {
    console.log("err", err.message);
  }
  if (jsonres.error) {
    return next(new ErrorHandler(jsonres.error.message, 400));
  }
  res.status(200).json({
    success: true,
    longLastingToken: jsonres?.access_token,
  });
});
