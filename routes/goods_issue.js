var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.goods_issue.selectGoodsIssue);
router.post("/insert", controller.goods_issue.insertGoodsIssue);
router.post("/bycode", controller.goods_issue.selectGoodsIssueByCode);
router.post("/update", controller.goods_issue.updateGoodsIssue);
router.post("/posting", controller.goods_issue.updatePostingGoodsIssue);
router.post("/delete", controller.goods_issue.deleteGoodsIssue);


module.exports = router;    