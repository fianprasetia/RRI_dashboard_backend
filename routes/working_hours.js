var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.working_hours.selectWorkingHours);
// router.post("/worksite", controller.attendance_machine.selectAttendanceMachineByWorksite);
router.post("/id", controller.working_hours.selectWorkingHoursByID);
router.post("/insert", controller.working_hours.insertWorkingHours);
// router.post("/bylanguage", controller.approval.selectApprovalByLanguage);
// router.post("/companytype", controller.approval.selectApprovalByCompanyType);
// router.post("/insert", controller.approval.insertApproval);
router.put("/update/:id", controller.working_hours.updateWorkingHours);


module.exports = router;
