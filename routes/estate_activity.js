var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.estate_activity.selectEstateActivity);
router.post("/attribute", controller.estate_activity.selectEstateActivityByAttribute);
router.post("/insert", controller.estate_activity.insertEstateActivity);
router.post("/code", controller.estate_activity.selectEstateActivityByCode);
router.post("/update", controller.estate_activity.updateEstateActivity);
router.post("/posting", controller.estate_activity.postingEstateActivity);
router.post("/delete", controller.estate_activity.deleteEstateActivity );



module.exports = router;