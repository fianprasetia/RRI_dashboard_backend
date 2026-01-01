var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.warehouse.selectWarehouse);
router.post("/byitem", controller.warehouse.selectWarehouseByItem);
router.post("/byitemwarehouse", controller.warehouse.selectWarehouseByItemWarehouse);
router.post("/byitemwarehousedetail", controller.warehouse.selectWarehouseByItemWarehouseDetail);
router.post("/close", controller.warehouse.updateWarehouseClose);
router.post("/reconciliation", controller.warehouse.selectReconciliationWarehouseClose);


module.exports = router;
