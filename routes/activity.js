var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.activity.selectActivity);
router.post("/update", controller.activity.updateActivity);
router.post("/bycode", controller.activity.selectActivityByCode);
router.post("/byactivitytype", controller.activity.selectActivityByType);
router.post("/insert", controller.activity.insertActivity);

module.exports = router;
