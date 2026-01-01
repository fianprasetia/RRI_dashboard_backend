var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.token.selectToken);
router.get("/all", controller.token.selectTokenAll);
router.post("/delete", controller.token.deleteToken);
router.post("/deletetype", controller.token.deleteTokenType);

module.exports = router