var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.asset_subtype.selectAssetSubType);
router.post("/bycode", controller.asset_subtype.selectAssetSubTypeByCode);
router.post("/insert", controller.asset_subtype.insertAssetSubType);
router.post("/update", controller.asset_subtype.updateAssetSubType);
router.post("/byassettypecode", controller.asset_subtype.selectAssetSubTypeByAssetTypeCode);


module.exports = router;