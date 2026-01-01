var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.item_master.selectItemMaster);
router.post("/insert", controller.item_master.insertItemMaster);
router.post("/id", controller.item_master.selectItemMasterByCode);
router.post("/codename", controller.item_master.selectItemMasterByCodeName);
router.put("/update/:id", controller.item_master.updateItemMaster);


module.exports = router;