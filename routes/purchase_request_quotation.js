var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.purchase_request_quotation.selectPurchaseRequestQuotation);
router.post("/insert", controller.purchase_request_quotation.insertPurchaseRequestQuotation);
router.post("/code", controller.purchase_request_quotation.selectPurchaseRequestQuotationByCode);
router.post("/update", controller.purchase_request_quotation.updatePurchaseRequestQuotaion);
router.post("/delete", controller.purchase_request_quotation.deletePurchaseRequestQuotation);
router.post("/posting", controller.purchase_request_quotation.updatePostingPurchaseRequestQuotation);
router.post("/purchaserequest", controller.purchase_request_quotation.selectPurchaseRequestQuotationByPurchaseRequest);


module.exports = router;    