const { default: fetch } = require("node-fetch");
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
  if (response.role !== "client") {
    return next(
      new ErrorHandler("Client can only be login by this route", 400)
    );
  }
  if (response.status === "Disabled") {
    return next(
      new ErrorHandler(
        "You are blocked by admin so cannot access this route",
        400
      )
    );
  }
  const match = await response.matchPassword(req.body.password);
  if (!match) {
    return next(new ErrorHandler("Invalid Credentials", 404));
  }
  response.password = undefined;
  const refreshTokeh = response.signJWTRefreshToken();
  sendCookieResponse(response, res, 200, refreshTokeh);
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

// getting long lasting access token for facebook business api

exports.getCampaignData = asyncHandler(async (req, res, next) => {
  let jsonres;
  try {
    const response = await fetch(
      `https://graph.facebook.com/v15.0/${req.query.current_account}/campaigns?fields=name%2Cobjective%2Cbid_strategy%2Cstatus%2Cbudget_remaining%2Cconversions%2Ceffective_status%2Cinsights%7Bcpm%2Ccpc%2Ccpp%2Creach%2Cimpressions%2Cconversions%2Cspend%7D&date_preset=${req.query.date_range}&access_token=${req.user.fbAccessToken[0].accessToken}`
    );
    jsonres = await response.json();
  } catch (err) {
    console.log("err", err.message);
  }
  if (jsonres?.error) {
    return next(new ErrorHandler(jsonres?.error?.message, 402));
  }
  res.status(200).json({
    success: true,
    data: jsonres?.data,
  });
});

// getting long lasting access token for facebook business api

exports.getAdSetData = asyncHandler(async (req, res, next) => {
  let jsonres;
  try {
    const response = await fetch(
      `https://graph.facebook.com/v15.0/${req.query.current_account}/adsets?fields=name%2Cinsights%7Breach%2Cspend%2Cimpressions%2Cattribution_setting%7D%2Clearning_stage_info%7Blast_sig_edit_ts%7D&date_preset=${req.query.date_range}&access_token=${req.user.fbAccessToken[0].accessToken}`
    );
    jsonres = await response.json();
  } catch (err) {
    console.log("err", err.message);
  }
  if (jsonres?.error) {
    return next(new ErrorHandler(jsonres?.error?.message, 402));
  }
  res.status(200).json({
    success: true,
    data: jsonres?.data,
  });
});

// getting long lasting access token for facebook business api

exports.getAdData = asyncHandler(async (req, res, next) => {
  let jsonres;
  try {
    const response = await fetch(
      `https://graph.facebook.com/v15.0/${req.query.current_account}/ads?fields=name%2Cinsights%7Bquality_ranking%2Cengagement_rate_ranking%2Cconversion_rate_ranking%2Creach%2Cspend%2Cimpressions%7D%2Cdate_preset=${req.query.date_range}&access_token=${req.user.fbAccessToken[0].accessToken}`
    );
    jsonres = await response.json();
  } catch (err) {
    console.log("err", err.message);
  }
  if (jsonres?.error) {
    return next(new ErrorHandler(jsonres?.error?.message, 402));
  }
  res.status(200).json({
    success: true,
    data: jsonres?.data,
  });
});

// getting long lasting access token for facebook business api

exports.createCampaign = asyncHandler(async (req, res, next) => {
  let jsonres;
  try {
    const response = await fetch(
      `https://graph.facebook.com/v15.0/${
        req.query.current_account
      }/campaigns?name=${req.body.name}&special_ad_categories=${
        req.body.special_ad_categories
      }&objective=${"LINK_CLICKS"}&access_token=${
        req.user.fbAccessToken[0].accessToken
      }`,
      {
        method: "POST",
      }
    );
    jsonres = await response.json();
  } catch (err) {
    console.log("err", err.message);
  }
  if (jsonres?.error) {
    return next(new ErrorHandler(jsonres?.error?.message, 402));
  }
  res.status(200).json({
    success: true,
    id: jsonres?.id,
  });
});

// getting long lasting access token for facebook business api

exports.createAdSet = asyncHandler(async (req, res, next) => {
  let jsonres;
  try {
    const response = await fetch(
      `https://graph.facebook.com/v15.0/${
        req.query.current_account
      }/adsets?daily_budget=${
        req.body.budgetAmount * 100
      }&bid_amount=2&billing_event=IMPRESSIONS&campaign_id=${
        req.body.id
      }&name=${
        req.body.name
      }&targeting=%7B%0A%20%20%20%20%20%20%20%22device_platforms%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%22mobile%22%0A%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%22facebook_positions%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%22feed%22%0A%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%22geo_locations%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%22countries%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%22US%22%0A%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%22publisher_platforms%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%22facebook%22%2C%0A%20%20%20%20%20%20%20%20%20%22audience_network%22%0A%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%22user_os%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%22IOS%22%0A%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%7D&access_token=${
        req.user.fbAccessToken[0].accessToken
      }`,
      {
        method: "POST",
      }
    );
    jsonres = await response.json();
    console.log("jsonres ", jsonres);
  } catch (err) {
    console.log("err", err.message);
  }
  if (jsonres?.error) {
    return next(new ErrorHandler(jsonres?.error?.message, 402));
  }
  res.status(200).json({
    success: true,
    data: jsonres,
  });
});

// getting long lasting access token for facebook business api

exports.createAd = asyncHandler(async (req, res, next) => {
  let jsonres;
  try {
    const response = await fetch(
      `https://graph.facebook.com/v15.0/${req.query.current_account}/adlabels?name=${req.body.name}&adset_id=${req.body.id}&access_token=${req.user.fbAccessToken[0].accessToken}`,
      {
        method: "POST",
      }
    );
    jsonres = await response.json();
    console.log("jsonres ", jsonres);
  } catch (err) {
    console.log("err", err.message);
  }
  if (jsonres?.error) {
    return next(new ErrorHandler(jsonres?.error?.message, 402));
  }
  res.status(200).json({
    success: true,
    id: jsonres?.id,
  });
});
// getting long lasting access token for facebook business api

exports.getUserAccounts = asyncHandler(async (req, res, next) => {
  let jsonres;
  try {
    const response = await fetch(
      `https://graph.facebook.com/v15.0/${req.user.fbAccessToken[0].accountId}/client_ad_accounts?fields=name%2Caccount_id&access_token=${req.user.fbAccessToken[0].accessToken}`
    );
    jsonres = await response.json();
    console.log("jsonres", jsonres);
  } catch (err) {
    console.log("err", err.message);
  }
  if (jsonres?.error) {
    return next(new ErrorHandler(jsonres?.error?.message, 402));
  }
  res.status(200).json({
    success: true,
    data: jsonres?.data,
  });
});
// getting long lasting access token for facebook business api

exports.deleteAnyThing = asyncHandler(async (req, res, next) => {
  try {
    await fetch(
      `https://graph.facebook.com/v15.0/${req.query.id}?access_token=${req.user.fbAccessToken[0].accessToken}`,
      {
        method: "DELETE",
      }
    );
  } catch (err) {
    console.log("err", err.message);
  }
  res.status(200).json({
    success: true,
  });
});
