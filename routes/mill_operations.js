var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.mill_oprations.selectMillOperations);
router.post("/insert", controller.mill_oprations.insertMillOprations);
router.post("/code", controller.mill_oprations.selectMillOperationsByCode);
router.post("/update", controller.mill_oprations.updateMillOperations);
router.post("/posting", controller.mill_oprations.postingMillOperations);
router.post("/delete", controller.mill_oprations.deleteMillOperations);

module.exports = router;