
const login = require("./login")
const home = require("./home")
const mill = require("./mill")

const controller = {};

controller.login = login;
controller.home = home;
controller.mill = mill;


module.exports = controller;
