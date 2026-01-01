const model = require("../models/index")
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectCatu = async function (req, res) {
    try {
        let selectCatuData = await model.hrd_catu.findAll({
            include: {
                model: model.hrd_catu_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectCatuData.length > 0) {
            res.json({
                access: "success",
                message: "Update data success",
                data: selectCatuData,
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
controller.selectCatuByLanguage = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectCatuByLanguageData = await model.hrd_catu.findAll({
            include: {
                model: model.hrd_catu_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectCatuByLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectCatuByLanguageData,
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