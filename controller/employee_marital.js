const model = require("../models/index")
const controller = {}
const { Op, json } = require("sequelize")

controller.selectEmployeeMarital = async function (req, res) {
    try {
        let selectEmployeeMaritalData = await model.hrd_employee_marital.findAll({
            include: {
                model: model.hrd_employee_marital_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeMaritalData.length > 0) {
            res.json({
                access: "success",
                data: selectEmployeeMaritalData,
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
controller.selectEmployeeMaritalDataByLanguage = async function (req, res) {
    try {
        language = req.body.language_POST
        let selectEmployeeMaritalDataByLanguageData = await model.hrd_employee_marital.findAll({
            include: {
                model: model.hrd_employee_marital_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeMaritalDataByLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectEmployeeMaritalDataByLanguageData,
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