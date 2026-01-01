var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.journal.selectJournal);

module.exports = router;    