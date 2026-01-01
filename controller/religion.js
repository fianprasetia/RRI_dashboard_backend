const model = require("../models/index")
const controller = {}
const { Op, json } = require("sequelize")

controller.selectEmployeeReligion = async function (req, res) {
    try {
        let selectEmployeeReligionData = await model.hrd_religion.findAll({
            include: {
                model: model.hrd_religion_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeReligionData.length > 0) {
            res.json({
                access: "success",
                data: selectEmployeeReligionData,
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

controller.selectEmployeeReligionDataByLanguage = async function (req, res) {
    try {
        language = req.body.language_POST
        let selectEmployeeReligionDataByLanguageData = await model.hrd_religion.findAll({
            include: {
                model: model.hrd_religion_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeReligionDataByLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectEmployeeReligionDataByLanguageData,
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