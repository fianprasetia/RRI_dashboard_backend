const model = require("../models/index")
const controller = {}
const { Op, json } = require("sequelize")

controller.selectEmployeeStatusTax = async function (req, res) {
    try {
        let selectEmployeeStatusTaxData = await model.hrd_employee_tax.findAll({
            include: {
                model: model.hrd_employee_tax_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeStatusTaxData.length > 0) {
            res.json({
                access: "success",
                message: "Update data success",
                data: selectEmployeeStatusTaxData,
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

controller.selectEmployeeStatusTaxByLanguage = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectEmployeeStatusTaxByLanguageData = await model.hrd_employee_tax.findAll({
            include: {
                model: model.hrd_employee_tax_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeStatusTaxByLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectEmployeeStatusTaxByLanguageData,
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