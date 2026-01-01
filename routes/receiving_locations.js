var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.receiving_locations.selectReceivingLocations);
router.post("/insert", controller.receiving_locations.insertReceivingLocations);
router.post("/code", controller.receiving_locations.selectreceiving_locationsByCode);
router.post("/update", controller.receiving_locations.updateReceivingLocations);


module.exports = router;    