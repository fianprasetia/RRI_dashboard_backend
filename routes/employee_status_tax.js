var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.employee_status_tax.selectEmployeeStatusTax);
router.post("/bylanguage", controller.employee_status_tax.selectEmployeeStatusTaxByLanguage);


module.exports = router;
