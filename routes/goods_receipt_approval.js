var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.goods_receipt_approval.selectApprovalGoodsReceipt);
router.post("/updatewarehouse", controller.goods_receipt_approval.updateApprovalGoodsReceiptWarehouse);
router.post("/updateasset", controller.goods_receipt_approval.updateApprovalGoodsReceiptAsset);


module.exports = router;