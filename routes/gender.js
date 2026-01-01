var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.gender.selectGender);
router.post("/bylanguage", controller.gender.selectGenderByLanguage);


module.exports = router;
