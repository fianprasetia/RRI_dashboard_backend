var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.partners_type.selectPartnersType);


module.exports = router;    