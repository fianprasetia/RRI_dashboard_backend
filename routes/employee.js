var express = require("express");
var router = express.Router();
const multer = require('multer');
const controller = require("../controller/index");

const TYPE_IMAGE ={
    "image/jpg":"jpg",
    "image/jpeg":"jpeg",
    "image/png":"png"
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './assets/image/employee/'); // Folder untuk menyimpan file
    },
    filename:function(req, file, cb){
        const uuid = crypto.randomUUID();
        const ext = TYPE_IMAGE[file.mimetype]
        cb(null, `${uuid}.${ext}`)
    }
  });
  const upload = multer({ storage: storage });  

router.post("/", controller.employee.selectEmployee);
router.post("/type", controller.employee.selectEmployeeByType);
router.post("/pur", controller.employee.selectEmployeeByPUR);
router.post("/worksite", controller.employee.selectEmployeeByWorksite);
router.post("/harvest", controller.employee.selectEmployeeByHaverst);
router.post("/gi", controller.employee.selectEmployeeByGI);
router.post("/id", controller.employee.selectEmployeeByID);
router.post("/basicsalary", controller.employee.selectEmployeeByBasicSalary);
router.put("/update/:id", upload.single('photo'), controller.employee.updateEmployee);
router.post("/insert", upload.single('photo'), controller.employee.insertEmployee);


module.exports = router;
