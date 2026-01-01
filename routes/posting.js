var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.posting.selectPosting);
router.post("/insert", controller.posting.insertPosting);
router.post("/code", controller.posting.selectPostingByCode);
router.post("/update", controller.posting.updatePosting);
// router.post("/companytype", controller.approval.selectApprovalByCompanyType);


module.exports = router;
