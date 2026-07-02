var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/semester1", controller.productivities_report.selectProductivitiesReport1);
router.post("/semester2", controller.productivities_report.selectProductivitiesReport2);
// router.post("/weekly", controller.mill.selectWeightWeekly);
// router.post("/monthly", controller.mill.selectWeightmonthly);

module.exports = router;
