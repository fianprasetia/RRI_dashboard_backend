var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.employee_status.selectEmployeeStatus);
router.post("/bylanguage", controller.employee_status.selectEmployeeStatusByLanguage);


module.exports = router;
