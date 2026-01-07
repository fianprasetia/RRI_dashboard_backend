var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.mll_sia.selectWeight);
router.post("/detail", controller.mll_sia.selectWeightDetail);

module.exports = router;
