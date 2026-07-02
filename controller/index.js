
const login = require("./login")
const home = require("./home")
const mill = require("./mill")
const productivities_report = require("./productivities_report")

const controller = {};

controller.login = login;
controller.home = home;
controller.mill = mill;
controller.productivities_report = productivities_report;


module.exports = controller;
