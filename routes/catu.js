var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.catu.selectCatu);
router.post("/bylanguage", controller.catu.selectCatuByLanguage);


module.exports = router;
