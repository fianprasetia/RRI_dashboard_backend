var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.employee_type.selectEmployeeType);
router.post("/bylanguage", controller.employee_type.selectEmployeeTypeDataByLanguage);
router.post("/bydaily", controller.employee_type.selectEmployeeDaily);


module.exports = router;
