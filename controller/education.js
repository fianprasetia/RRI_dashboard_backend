const model = require("../models/index")
const controller = {}
const { Op, json } = require("sequelize")

controller.selectEmployeeEducation = async function (req, res) {
    try {
        let selectEmployeeEducationData = await model.hrd_education.findAll({
            include: {
                model: model.hrd_education_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeEducationData.length > 0) {
            res.json({
                access: "success",
                data: selectEmployeeEducationData,
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

controller.selectEmployeeEducationDataByLanguage = async function (req, res) {
    try {
        language = req.body.language_POST
        let selectEmployeeEducationDataByLanguageData = await model.hrd_education.findAll({
            include: {
                model: model.hrd_education_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeEducationDataByLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectEmployeeEducationDataByLanguageData,
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