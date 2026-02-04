var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.home.selectWeightDaily);
router.post("/weekly", controller.home.selectWeightWeekly);
router.post("/monthly", controller.home.selectWeightMonthly);
router.post("/dispatchcpoweekly", controller.home.selectDispatchCPOWeekly);
router.post("/contractMonthly", controller.home.selectContractMonthly);

module.exports = router;
