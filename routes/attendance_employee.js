var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.ateendance_employee.selectAttendanceLog);
router.post("/insert", controller.ateendance_employee.insertAttendanceLog);
// router.post("/bylanguage", controller.approval.selectApprovalByLanguage);
// router.post("/companytype", controller.approval.selectApprovalByCompanyType);
// router.post("/insert", controller.approval.insertApproval);


module.exports = router;
