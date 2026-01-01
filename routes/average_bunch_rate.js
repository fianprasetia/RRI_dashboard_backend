var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.average_bunch_rate.selectAverageBunchRate);
router.post("/update", controller.average_bunch_rate.updateAverageBunchRate);
router.post("/byproduction", controller.average_bunch_rate.selectAverageBunchRateByProduction);
router.post("/bycode", controller.average_bunch_rate.selectAverageBunchRateByCode);
router.post("/insert", controller.average_bunch_rate.insertAverageBunchRate);

module.exports = router;
