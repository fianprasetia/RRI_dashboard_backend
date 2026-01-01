var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.religion.selectEmployeeReligion);
router.post("/bylanguage", controller.religion.selectEmployeeReligionDataByLanguage);


module.exports = router;
