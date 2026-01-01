var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.menu_mobile.selectMenuMobile);
router.post("/insert", controller.menu_mobile.insertMenuMobile);
router.post("/code", controller.menu_mobile.selectMenuMobileByCode);
router.put("/update/:code", controller.menu_mobile.updateMenuMobile);

module.exports = router;
