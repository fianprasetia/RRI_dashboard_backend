const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');


controller.selectEmployeeType = async function (req, res) {
    try {
        let selectEmployeeTypeData = await model.hrd_employee_type.findAll({
            include: {
                model: model.hrd_employee_type_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeTypeData.length > 0) {
            res.json({
                access: "success",
                data: selectEmployeeTypeData,
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
controller.selectEmployeeTypeDataByLanguage = async function (req, res) {
    try {
        language = req.body.language_POST
        let selectEmployeeTypeDataByLanguageData = await model.hrd_employee_type.findAll({
            include: {
                model: model.hrd_employee_type_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectEmployeeTypeDataByLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectEmployeeTypeDataByLanguageData,
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
controller.selectEmployeeDaily = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;

        const selectEmployeeTypeData = await selectEmployeeType()
        if (selectEmployeeTypeData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectEmployeeTypeData);
        function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data && { data })
            });
        }

        function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }

        async function selectEmployeeType() {
            return await model.hrd_employee_type.findAll({
                include: [
                    {
                        model: model.hrd_employee_type_translations,
                        attributes: ["language_code", "translation"],
                        where: {
                            language_code: language
                        },
                    },

                ],
                where:
                {
                    employee_type_code: {
                        [Op.in]: [1, 2, 3, 4]
                    },
                },
            });
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
}
module.exports = controller;