var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

// router.post("/", controller.activity.selectActivity);
router.post("/bycode", controller.accounting_periods.selectAccountingPeriods);
router.post("/postingclose", controller.accounting_periods.updateAccountingPerodsClose);
router.post("/open", controller.accounting_periods.selectAccountingPeriodsOpen);
router.post("/postingopen", controller.accounting_periods.updateAccountingPerodsOpen);
// router.post("/update", controller.activity.updateActivity);
// router.post("/byactivitytype", controller.activity.selectActivityByType);
// router.post("/insert", controller.activity.insertActivity);

module.exports = router;
