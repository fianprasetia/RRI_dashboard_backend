var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.term_of_payment.selectTOP);
router.post("/insert", controller.term_of_payment.insertTOP);
router.post("/code", controller.term_of_payment.selectTOPByCode);
router.post("/update", controller.term_of_payment.updateTOP);
// router.post("/bycodepurchaserequest", controller.purchase_request.selectPurchaseRequestByCode);
// router.post("/posting", controller.purchase_request.updatePostingPurchaseRequest);
// router.post("/delete", controller.purchase_request.deletePurchaseRequest);
// router.post("/updatedelegation", controller.purchase_request.updatePurchaseRequestDelegation);
// router.post("/delegation", controller.purchase_request.selectPurchaseRequestDelegation);


module.exports = router;    