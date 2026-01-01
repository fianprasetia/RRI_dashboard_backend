var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.payment_voucher_type.selectVoucherType);
router.post("/bycode", controller.payment_voucher_type.selectVoucherTypeByCode);
router.post("/insert", controller.payment_voucher_type.insertVoucherType);
router.post("/update", controller.payment_voucher_type.updateVoucherType);


module.exports = router;