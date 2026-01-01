var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.block_master.selectBlockMaster);
router.post("/insert", controller.block_master.insertBlockMaster);
router.post("/bycode", controller.block_master.selectBlockMasterByCode);
router.post("/update", controller.block_master.updateBlockMaster);


module.exports = router;