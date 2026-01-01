var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.harvest_incentive.selectHarvestIncentive);
router.post("/insert", controller.harvest_incentive.insertHarvestIncentive);
router.post("/bycode", controller.harvest_incentive.selectHarvestIncentiveByCode);
router.post("/update", controller.harvest_incentive.updateHarvestIncentive);

module.exports = router;    