var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.department.selectDepartment);
router.post("/bylanguage", controller.department.selectDepartmentByLanguage);
router.post("/insert", controller.department.insertDepartment);
router.post("/bycode", controller.department.selectDepartmentByCode);
router.post("/update", controller.department.updateDepartment);


module.exports = router;
