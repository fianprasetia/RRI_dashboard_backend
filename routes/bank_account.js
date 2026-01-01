var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.bank_account.selectBankAccount);
router.post("/insert", controller.bank_account.insertBankAccount);
router.post("/bycode", controller.bank_account.selectBankAccountByCode);
router.post("/bycompany", controller.bank_account.selectBankAccountByCompany);
router.post("/update", controller.bank_account.updateBankAccount);

module.exports = router;    