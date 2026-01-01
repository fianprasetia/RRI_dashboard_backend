var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.partners.selectPartners);
router.get("/quotation", controller.partners.selectPartnersQuotation);
router.post("/insert", controller.partners.insertPartners);
router.post("/code", controller.partners.selectPartnersByCode);
router.post("/update", controller.partners.updatePartners);


module.exports = router;    