var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.employee_assign.selectAssignEmployee);
// router.post("/worksite", controller.attendance_machine.selectAttendanceMachineByWorksite);
router.post("/id", controller.employee_assign.selectAssignEmployeeByID);
router.post("/insert", controller.employee_assign.insertAssignEmployee);
// router.post("/bylanguage", controller.approval.selectApprovalByLanguage);
// router.post("/companytype", controller.approval.selectApprovalByCompanyType);
// router.post("/insert", controller.approval.insertApproval);
router.put("/update/:id", controller.employee_assign.updateAssignEmployee);


module.exports = router;
