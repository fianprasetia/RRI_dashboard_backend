var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.home.selectWeight);

module.exports = router;
