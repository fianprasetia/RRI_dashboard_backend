const model = require("../models/index")
const controller = {}
const { Op, json } = require("sequelize")

controller.selectEmployeeSalary = async function (req, res) {
    try {
        let selectEmployeeSalaryData = await model.hrd_employee_salary.findAll({
            include: {
                model: model.hrd_employee_salary_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeSalaryData.length > 0) {
            res.json({
                access: "success",
                data: selectEmployeeSalaryData,
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
controller.selectEmployeeSalaryDataByLanguage = async function (req, res) {
    try {
        language = req.body.language_POST
        let selectEmployeeSalaryDataByLanguageData = await model.hrd_employee_salary.findAll({
            include: {
                model: model.hrd_employee_salary_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeSalaryDataByLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectEmployeeSalaryDataByLanguageData,
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