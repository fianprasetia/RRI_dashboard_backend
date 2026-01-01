var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.get("/", controller.employee_marital.selectEmployeeMarital);
router.post("/bylanguage", controller.employee_marital.selectEmployeeMaritalDataByLanguage);


module.exports = router;
