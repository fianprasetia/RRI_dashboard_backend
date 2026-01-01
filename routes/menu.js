var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.menu.selectMenu);
router.post("/insert", controller.menu.insertMenu);
router.post("/code", controller.menu.selectMenuByCode);
router.put("/update/:code", controller.menu.updateMenu);
// router.get("/login", controller.karyawan.selectKaryawanLogin);
// router.put("/:nik", controller.karyawan.updateEmployee);
// router.post("/insert", controller.karyawan.insertKaryawan);
// router.post("/selectbynik", controller.karyawan.selectKaryawanByNIK);


module.exports = router;
