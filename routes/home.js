var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.home.selectWeightDaily);
router.post("/weekly", controller.home.selectWeightWeekly);
router.post("/monthly", controller.home.selectWeightMonthly);

module.exports = router;
