var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.login.selectLogin);
router.post("/mobile", controller.login.selectLoginMobile);
router.post("/update/password", controller.login.updatePasswordLoginUser);
// router.post("/insert", controller.login.insertLogin);
// router.get("/login", controller.karyawan.selectKaryawanLogin);
// router.put("/:nik", controller.karyawan.updateEmployee);
// router.post("/insert", controller.karyawan.insertKaryawan);
// router.post("/selectbynik", controller.karyawan.selectKaryawanByNIK);


module.exports = router;
