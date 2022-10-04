const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config("../../.env");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
  },
  userName: {
    type: String,
    required: [true, "User Name is required"],
    unique: [true, "user should be unique"],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minLength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["client"],
    default: "client",
  },
  status: {
    type: String,
    enum: ["Active", "Disabled"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  fbAccessToken: {
    type: [
      {
        accessToken: String,
        accountId: String,
      },
    ],
    required: [true, "Fb Access Token + Label are required fields"],
  },
  resetpasswordToken: String,
  resetpasswordExpires: Date,
});

userSchema.methods.signJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIREE,
  });
};

userSchema.methods.signJWTRefreshToken = function () {
  return jwt.sign(
    { userName: this.userName },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIREE,
    }
  );
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  let salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("user", userSchema);
