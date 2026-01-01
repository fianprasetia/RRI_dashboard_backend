var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.purchase_request.selectPurchaseRequest);
router.post("/insert", controller.purchase_request.insertPurchaseRequest);
router.post("/bycodepurchaserequest", controller.purchase_request.selectPurchaseRequestByCode);
router.post("/posting", controller.purchase_request.updatePostingPurchaseRequest);
router.post("/delete", controller.purchase_request.deletePurchaseRequest);
router.post("/update", controller.purchase_request.updatePurchaseRequest);
router.post("/updatedelegation", controller.purchase_request.updatePurchaseRequestDelegation);
router.post("/updateitem", controller.purchase_request.updatePurchaseRequestItem);
router.post("/delegation", controller.purchase_request.selectPurchaseRequestDelegation);
router.post("/delegationcode", controller.purchase_request.selectPurchaseRequestDelegationByCode);
router.post("/quotation", controller.purchase_request.selectPurchaseRequestQuotation);
router.post("/quotationcode", controller.purchase_request.selectPurchaseRequestQuotationByCode);
router.post("/done", controller.purchase_request.updatePurchaseRequestDone);


module.exports = router;    