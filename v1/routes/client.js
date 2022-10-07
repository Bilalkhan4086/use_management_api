const express = require("express");
const {
  loginClient,
  getClientDetails,
  getCampaignData,
  getAdSetData,
  getAdData,
  createCampaign,
  createAdSet,
  createAd,
  getUserAccounts,
  deleteAnyThing,
} = require("../controller/client");
const { authorizedRoles, protected } = require("../middleware/auth");

const router = express.Router();

router.post("/login", loginClient);
router.get("/details", protected, authorizedRoles("client"), getClientDetails);
router.get(
  "/get_campaign_data",
  protected,
  authorizedRoles("client"),
  getCampaignData
);
router.get(
  "/get_adset_data",
  protected,
  authorizedRoles("client"),
  getAdSetData
);
router.get("/get_a_data", protected, authorizedRoles("client"), getAdData);
router.post(
  "/create_campaign",
  protected,
  authorizedRoles("client"),
  createCampaign
);
router.post("/create_adset", protected, authorizedRoles("client"), createAdSet);
router.post("/create_ad", protected, authorizedRoles("client"), createAd);
router.get(
  "/get_user_accounts",
  protected,
  authorizedRoles("client"),
  getUserAccounts
);
router.delete(
  "/delete_it",
  protected,
  authorizedRoles("client"),
  deleteAnyThing
);
module.exports = router;
