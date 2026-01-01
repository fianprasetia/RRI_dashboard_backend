var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.employee_salary_system.selectEmployeeSalary);
router.post("/bylanguage", controller.employee_salary_system.selectEmployeeSalaryDataByLanguage);


module.exports = router;
