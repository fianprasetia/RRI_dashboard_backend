var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.purchase_request_approval.selectApprovalPurchaseRequest);
router.post("/update", controller.purchase_request_approval.updateApprovalPurchaseRequest);


module.exports = router;