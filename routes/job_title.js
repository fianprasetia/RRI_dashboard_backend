var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.job_title.selectJobTitle);
router.post("/bylanguage", controller.job_title.selectJobTitleByLanguage);


module.exports = router;
