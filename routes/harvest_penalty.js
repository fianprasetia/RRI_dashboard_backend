var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.harvest_penalty.selectHarvestPenalty);
router.post("/insert", controller.harvest_penalty.insertHarvestPenalty);
router.post("/bycode", controller.harvest_penalty.selectHarvestPenaltyByCode);
router.post("/update", controller.harvest_penalty.updateHarvestPenalty);
router.post("/harvest", controller.harvest_penalty.selectHarvestPenaltyByHarvest);

module.exports = router;    