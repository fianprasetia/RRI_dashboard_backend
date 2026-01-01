var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.approval_type.selectApprovalType);
router.post("/bylanguage", controller.approval_type.selectApprovalTypeByLanguage);


module.exports = router;
