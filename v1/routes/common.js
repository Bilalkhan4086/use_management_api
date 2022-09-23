const express = require("express");
const { refreshAccessToken } = require("../controller/common");

const router = express.Router();


router.get("/refresh",refreshAccessToken);

module.exports = router;
