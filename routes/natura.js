var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.natura.selectNatura);
router.post("/insert", controller.natura.insertNatura);
router.post("/code", controller.natura.selectNaturaByCode);
router.post("/update", controller.natura.updateNatura);

module.exports = router;    