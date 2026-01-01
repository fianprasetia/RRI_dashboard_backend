var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.holiday.selectHoliday);
router.post("/insert", controller.holiday.insertHoliday);
router.post("/code", controller.holiday.selectHolidayByCode);
router.post("/update", controller.holiday.updateHoliday);

module.exports = router;    