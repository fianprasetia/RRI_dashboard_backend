var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.approval.selectApproval);
router.post("/bylanguage", controller.approval.selectApprovalByLanguage);
router.post("/companytype", controller.approval.selectApprovalByCompanyType);
router.post("/insert", controller.approval.insertApproval);
router.post("/update", controller.approval.updateApproval);


module.exports = router;
