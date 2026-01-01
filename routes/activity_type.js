var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.activity_type.selectActivityType);
router.post("/update", controller.activity_type.updateActivityType);
router.post("/bycode", controller.activity_type.selectActivityTypeByCode);
router.post("/insert", controller.activity_type.insertActivityType);
router.post("/activity", controller.activity_type.selectActivityTypeByActivity);

module.exports = router;
