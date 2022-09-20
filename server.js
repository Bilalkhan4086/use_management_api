const express = require("express");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const adminRoute = require("./v1/routes/admin");
const clientRoute = require("./v1/routes/client");
const connectionDB = require("./v1/config/db");
const errorHandler = require("./v1/middleware/error");
require("dotenv").config("./.env");

const app = express();
// Database Connection
connectionDB();

// middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// adding routes

app.use("/admin", adminRoute);
app.use("/client", clientRoute);

// Error Handling

app.use(errorHandler);

// Listening Port
app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log("app Not working");
  }
});
