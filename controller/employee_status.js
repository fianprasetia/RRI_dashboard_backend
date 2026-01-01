const model = require("../models/index")
const controller = {}
const { Op, json } = require("sequelize")

controller.selectEmployeeStatus = async function (req, res) {
    try {
        let selectEmployeeStatusData = await model.hrd_employee_status.findAll({
            include: {
                model: model.hrd_employee_status_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeStatusData.length > 0) {
            res.json({
                access: "success",
                message: "Update data success",
                data: selectEmployeeStatusData,
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

controller.selectEmployeeStatusByLanguage = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectEmployeeStatuseData = await model.hrd_employee_status.findAll({
            include: {
                model: model.hrd_employee_status_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeStatuseData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectEmployeeStatuseData,
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