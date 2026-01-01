var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.purchase_request_report.selectPurchaseRequest);

module.exports = router;    