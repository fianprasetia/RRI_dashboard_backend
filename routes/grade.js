var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.grade.selectGrade);
router.post("/bylanguage", controller.grade.selectGradeByLanguage);


module.exports = router;
