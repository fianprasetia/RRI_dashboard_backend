var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.goods_issue_approval.selectApprovalGoodsIssue);
router.post("/update", controller.goods_issue_approval.updateApprovalGoodsIssue);


module.exports = router;