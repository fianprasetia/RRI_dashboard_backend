var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.harvest_penalty_type.selectHarvestPenaltyType);
router.post("/insert", controller.harvest_penalty_type.insertHarvestPenaltyType);
router.post("/bycode", controller.harvest_penalty_type.selectHarvestPenaltyTypeByCode);
router.post("/update", controller.harvest_penalty_type.updateHarvestPenaltyType);
// router.post("/updatestatus", controller.asset.updateAssetStatus);
// router.post("/posting", controller.asset.postingAsset);
// router.post("/byworksite", controller.asset.selectAssetByWorksite);
// router.post("/bydepreciation", controller.asset.selectAssetDepreciation);
// router.post("/postingbydepreciation", controller.asset.postingAssetDeprecation);


module.exports = router;