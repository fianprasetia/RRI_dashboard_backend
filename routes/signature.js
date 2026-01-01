var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.signature.selectSignature);
router.post("/insert", controller.signature.insertSignature);
router.post("/code", controller.signature.selectSignatureByCode);
router.post("/update", controller.signature.updateSignature);


module.exports = router;    