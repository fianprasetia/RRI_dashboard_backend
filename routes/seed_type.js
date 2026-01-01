var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.seed_type.selectSeedType);


module.exports = router;