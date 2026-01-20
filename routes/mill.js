var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.mill.selectWeight);
router.post("/weekly", controller.mill.selectWeightWeekly);
router.post("/monthly", controller.mill.selectWeightmonthly);

module.exports = router;
