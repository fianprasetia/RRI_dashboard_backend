var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.approval_transaction.selectApprovalTransaction);


module.exports = router;