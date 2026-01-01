var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.payment_voucher.selectPaymentVoucher);
router.post("/bycode", controller.payment_voucher.selectPaymentVoucherByCode);
router.post("/bycashbank", controller.payment_voucher.selectPaymentVoucherByCashBank);
router.post("/insert", controller.payment_voucher.insertPaymentVoucher);
router.post("/update", controller.payment_voucher.updatePaymentVoucher);
router.post("/delete", controller.payment_voucher.deletePaymentVoucher);
router.post("/posting", controller.payment_voucher.postingPaymentVoucher);

module.exports = router;