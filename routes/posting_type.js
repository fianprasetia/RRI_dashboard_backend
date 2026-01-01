var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.posting_type.selectPostingType);
router.post("/bylanguage", controller.posting_type.selectPostingTypeByLanguage);


module.exports = router;
