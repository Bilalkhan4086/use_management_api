const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const adminRoute = require("./v1/routes/admin");
const clientRoute = require("./v1/routes/client");
const commonRoute = require("./v1/routes/common");
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
app.use(cors("http://localhost:3000"));
// adding routes

app.use("/admin", adminRoute);
app.use("/client", clientRoute);
app.use("/", commonRoute);

// Error Handling

app.use(errorHandler);

// Listening Port
app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log("app Not working");
  }
});
