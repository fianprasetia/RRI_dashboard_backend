var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.asset.selectAsset);
router.post("/bycode", controller.asset.selectAssetByCode);
router.post("/update", controller.asset.updateAsset);
router.post("/updatestatus", controller.asset.updateAssetStatus);
router.post("/posting", controller.asset.postingAsset);
router.post("/byworksite", controller.asset.selectAssetByWorksite);
router.post("/bydepreciation", controller.asset.selectAssetDepreciation);
router.post("/postingbydepreciation", controller.asset.postingAssetDeprecation);


module.exports = router;