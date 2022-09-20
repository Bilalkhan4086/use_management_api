const express = require("express");
const { loginClient, getClientDetails } = require("../controller/client");
const { authorizedRoles, protected } = require("../middleware/auth");

const router = express.Router();

router.post("/login", loginClient);
router.get("/details", protected, authorizedRoles("client"), getClientDetails);

module.exports = router;
