var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.employee_assign_report.selectAssignEmployeeReport);

module.exports = router;
