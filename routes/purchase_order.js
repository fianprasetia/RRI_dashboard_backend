var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.purchase_order.selectPurchaseOrder);
router.post("/code", controller.purchase_order.selectPurchaseOrdertByCode);
router.post("/posting", controller.purchase_order.updatePostingPurchaseOrder);
router.post("/delete", controller.purchase_order.deletePurchaseOrder);
router.post("/goodreceipt", controller.purchase_order.selectPurchaseOrderGoodReceipt);
router.post("/codegoodreceipt", controller.purchase_order.selectPurchaseOrderGoodReceiptByCode);
router.post("/downpayment", controller.purchase_order.selectPurchaseOrderDownPayment);
router.post("/payment", controller.purchase_order.selectPurchaseOrderPayment);
router.post("/return", controller.purchase_order.updateReturnPurchaseOrder);


module.exports = router;    