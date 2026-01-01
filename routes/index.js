var express = require('express');
var router = express.Router();
var koneksi = require("../config/database");

/* GET home page. */
router.post('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
