var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.company.selectCompany);
router.post("/type", controller.company.selectCompanyByType);
router.post("/worksite", controller.company.selectCompanyByWorksite);
router.post("/neraca", controller.company.selectCompanyByNecara);
router.post("/province", controller.company.selectCompanyByProvince);
router.post("/changeworksite", controller.company.selectCompanyChangeWorksite);
router.post("/coa", controller.company.selectCompanyCOA);
router.post("/asset", controller.company.selectCompanyAsset);
router.post("/approvalworksite", controller.company.selectCompanyApprovalWorksite);
router.post("/code", controller.company.selectCompanyByCode);
router.post("/insert", controller.company.insertCompany);
router.post("/warehouse", controller.company.selectCompanyWarehouse);
router.post("/warehouseworksite", controller.company.selectCompanyWarehouseWorksite);
router.post("/warehousecloseout", controller.company.selectCompanyWarehouseCloseout);
router.post("/company", controller.company.selectCompanyByPVCompany);
router.post("/level02", controller.company.selectCompanyByLevel02);
router.post("/location", controller.company.selectCompanyByPVLocation);
router.post("/division", controller.company.selectCompanyByDivision);
router.post("/block", controller.company.selectBlock);
router.post("/estate", controller.company.selectCompanyByEstate);
router.put("/update/:code", controller.company.updateCompany);
router.post("/basicsalary", controller.company.selectCompanyByBasicSalary);
router.post("/harvest", controller.company.selectCompanyByHarvest);
router.post("/station", controller.company.selectCompanyByStation);
// router.post("/insert", controller.karyawan.insertKaryawan);
// router.post("/selectbynik", controller.karyawan.selectKaryawanByNIK);


module.exports = router;
