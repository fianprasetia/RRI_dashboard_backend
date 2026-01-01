var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.basic_salary.selectBasicSalary);
router.post("/update", controller.basic_salary.updateBasicSalary);
router.post("/code", controller.basic_salary.selectBasicSalaryByCode);
router.post("/insert", controller.basic_salary.insertBasicSalary);

module.exports = router;
