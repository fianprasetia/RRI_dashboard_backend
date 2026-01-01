var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.coa.selectCOA);
router.post("/insert", controller.coa.insertCOA);
router.post("/code", controller.coa.selectCOAByCode);
router.post("/update", controller.coa.updateCOA);
router.post("/level5", controller.coa.selectCOAByLevel5);
router.post("/paymentvoucher", controller.coa.selectCOAByPaymentVoucher);
router.post("/depreciation", controller.coa.selectCOAByDepreciation);
router.post("/fixed", controller.coa.selectCOAByFixedAsset);
router.post("/activitytype", controller.coa.selectCOAByActivityType);
router.post("/cashbankheader", controller.coa.selectCOAByCashBankHeader);
router.post("/bankaccount", controller.coa.selectCOAByBankAccount);


module.exports = router;    