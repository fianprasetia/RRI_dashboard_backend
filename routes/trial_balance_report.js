var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.trial_balance_report.selectTrialBalance);

module.exports = router;    