var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.item_category.selectItemCategory);


module.exports = router;