var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.goods_receipt_warehouse.selectGoodsReceipt);
router.post("/insert", controller.goods_receipt_warehouse.insertGoodsReceipt);
router.post("/bycode", controller.goods_receipt_warehouse.selectGoodsReceiptByCode);
router.post("/update", controller.goods_receipt_warehouse.updateGoodsReceipt);
router.post("/posting", controller.goods_receipt_warehouse.updatePostingGoodsReceipt);
router.post("/delete", controller.goods_receipt_warehouse.deleteGoodsReceipt);
// router.post("/updatedelegation", controller.purchase_request.updatePurchaseRequestDelegation);
// router.post("/updateitem", controller.purchase_request.updatePurchaseRequestItem);
// router.post("/delegation", controller.purchase_request.selectPurchaseRequestDelegation);
// router.post("/delegationcode", controller.purchase_request.selectPurchaseRequestDelegationByCode);
// router.post("/quotation", controller.purchase_request.selectPurchaseRequestQuotation);
// router.post("/quotationcode", controller.purchase_request.selectPurchaseRequestQuotationByCode);


module.exports = router;    