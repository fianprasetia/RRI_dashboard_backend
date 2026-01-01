var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.transaction_unposting.selectTransactionUnposting);
router.post("/bypaymentvoucher", controller.transaction_unposting.selectTransactionUnpostingBypaymentVoucher);
router.post("/unpostingbypaymentvoucher", controller.transaction_unposting.updateTransactionUnpostingBypaymentVoucher);
router.post("/bycashbank", controller.transaction_unposting.selectTransactionUnpostingByCashBank);
router.post("/unpostingbycashbank", controller.transaction_unposting.updateTransactionUnpostingByCashBank);


module.exports = router;
