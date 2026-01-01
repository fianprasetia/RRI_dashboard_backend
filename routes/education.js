var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.education.selectEmployeeEducation);
router.post("/bylanguage", controller.education.selectEmployeeEducationDataByLanguage);


module.exports = router;
