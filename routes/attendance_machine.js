var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.attendance_machine.selectAttendanceMachine);
router.post("/worksite", controller.attendance_machine.selectAttendanceMachineByWorksite);
router.post("/id", controller.attendance_machine.selectAttendanceMachineByID);
router.post("/insert", controller.attendance_machine.insertAttendanceMachine);
// router.post("/bylanguage", controller.approval.selectApprovalByLanguage);
// router.post("/companytype", controller.approval.selectApprovalByCompanyType);
// router.post("/insert", controller.approval.insertApproval);
router.put("/update/:id", controller.attendance_machine.updateAttendanceMachine);


module.exports = router;
