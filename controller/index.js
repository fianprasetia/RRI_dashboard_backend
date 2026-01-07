
const login = require("./login")
const home = require("./home")
const mll_sia = require("./mll_sia")

const controller = {};

controller.login = login;
controller.home = home;
controller.mll_sia = mll_sia;


module.exports = controller;
