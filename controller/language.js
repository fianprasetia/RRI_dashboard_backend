const model = require("../models/index")
const messages = require("./message")
const controller = {}
const { Op, json } = require("sequelize")

controller.selectLanguage = async function (req, res) {
    try {
        let selectLanguageData = await model.adm_language.findAll({
            order: [
                ['language_code', 'ASC'],
            ],
        });
        if (selectLanguageData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectLanguageData,
            });
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}
module.exports = controller;