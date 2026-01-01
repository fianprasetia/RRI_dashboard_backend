var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.cash_bank.selectCashBank);
router.post("/insert", controller.cash_bank.insertCashBank);
router.post("/bycode", controller.cash_bank.selectCashBankByCode);
router.post("/update", controller.cash_bank.updateCashBank);
router.post("/postingout", controller.cash_bank.postingCashBankOut);
router.post("/postingin", controller.cash_bank.postingCashBankIn);
router.post("/delete", controller.cash_bank.deleteCashBank);
// router.post("/bycashbank", controller.payment_voucher.selectPaymentVoucherByCashBank);

module.exports = router;