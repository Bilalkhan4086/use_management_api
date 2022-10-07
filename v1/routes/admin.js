const express = require("express");
const { protected, authorizedRoles } = require("../middleware/auth");
const {
  loginAdmin,
  getAdminDetails,
  addNewClient,
  getAllUserDetails,
  changeClientStatus,
  getLongLastingToken,
} = require("../controller/admin");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/details", protected, authorizedRoles("admin"), getAdminDetails);
router.get(
  "/details/getAllUsers",
  protected,
  authorizedRoles("admin"),
  getAllUserDetails
);
router.get(
  "/longlastingtoken",
  protected,
  authorizedRoles("admin"),
  getLongLastingToken
);
router.post(
  "/client/create",
  protected,
  authorizedRoles("admin"),
  addNewClient
);
router.put(
  "/client/change-status",
  protected,
  authorizedRoles("admin"),
  changeClientStatus
);

module.exports = router;
