var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.asset_type.selectAssetType);
router.post("/bycode", controller.asset_type.selectAssetTypeByCode);
router.post("/insert", controller.asset_type.insertAssetType);
router.post("/update", controller.asset_type.updateAssetType);


module.exports = router;