const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');


controller.selectDepartment = async function (req, res) {
    try {
        language = req.body.language_POST
        let selectDepartmentData = await model.hrd_department.findAll({
            include: {
                model: model.hrd_department_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['status', 'DESC'],
                ['description', 'ASC'],
            ],
        });
        if (selectDepartmentData.length > 0) {
            res.json({
                access: "success",
                data: selectDepartmentData,
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
controller.selectDepartmentByLanguage = async function (req, res) {
    try {
        language = req.body.language_POST
        let selectDepartmentByLanguageData = await model.hrd_department.findAll({
            include: {
                model: model.hrd_department_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            where: {
                status: 1
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectDepartmentByLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectDepartmentByLanguageData,
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
controller.insertDepartment = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            status_POST: status,
            detail: details
        } = requestData;

        const newCode = await generateCode();

        const languageData = await selectLanguage();

        const insertDepartmentData = await insertDepartment(newCode);
        if (!insertDepartmentData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await insertDepartmentDataTranslations(newCode, languageData);

        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');

        async function generateCode() {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let result = "";
            let isExist = true;

            while (isExist) {
                result = "";
                for (let i = 0; i < 3; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    result += characters[randomIndex];
                }
                const code = await model.hrd_department.findOne({
                    where: {
                        department_code: result
                    }
                });

                if (!code) {
                    isExist = false;
                }
            }
            return result;
        }


        async function selectLanguage() {
            return await model.adm_language.findAll({
                order: [['language_code', 'ASC']],
                transaction
            });
        }
        async function insertDepartment(newCode) {
            return await model.hrd_department.create({
                department_code: newCode,
                description: details[0].language_POST,
                status
            }, { transaction });
        }

        async function insertDepartmentDataTranslations(newCode, languageData) {
            const rowsToInsert = details.map((detail, i) => ({
                department_code: newCode,
                language_code: languageData[i]?.language_code,
                translation: detail.language_POST
            }));
            await model.hrd_department_translations.bulkCreate(rowsToInsert, { transaction });
        }

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

        function logAction(status) {
            logger.info(`Insert Department`, {
                "1.username": username,
                "2.module": "insertDepartment",
                "3.status": status,
                "4.action": req.body
            });
        }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error,
        });
    }


};
controller.selectDepartmentByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            code_POST: code,
        } = requestData;

        const selectDepartmentData = await selectDepartment()
        if (selectDepartmentData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectDepartmentData);
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

        async function selectDepartment() {
            return await model.hrd_department.findAll({
                include: [
                    {
                        model: model.hrd_department_translations,
                        attributes: ["language_code", "translation"],
                    },

                ],
                where:
                {
                    department_code: code
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
controller.updateDepartment = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            status_POST: status,
            code_POST: code,
            detail: details
        } = requestData;

        const updateDepartmentData = await updateDepartment()
        if (!updateDepartmentData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const languageData = await selectLanguage()

        const deleteDepartmentData = await deleteDepartment()
        if (!deleteDepartmentData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const insertDepartmentTranslationsData = await insertDepartmentTranslations(languageData)
        if (!insertDepartmentTranslationsData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData, insertDepartmentTranslationsData);
        logAction('success');

        async function updateDepartment() {
            var languageMenu = details[0]["language_POST"]
            return await model.hrd_department.update(
                {
                    description: languageMenu,
                    status: status
                },
                {
                    where:
                    {
                        department_code: code,
                    },
                    transaction,
                },
            );
        }
        async function deleteDepartment() {
            return await model.hrd_department_translations.destroy({
                where: {
                    department_code: code,
                },
                transaction
            });
        }
        async function selectLanguage() {
            return await model.adm_language.findAll({
                order: [
                    ['language_code', 'ASC'],
                ],
                transaction: transaction
            });

        }
        async function insertDepartmentTranslations(languageData) {
            const rowsToInsert = details.map((detail, i) => ({
                department_code: code,
                language_code: languageData[i]?.language_code,
                translation: detail.language_POST
            }));
            return await model.hrd_department_translations.bulkCreate(rowsToInsert, { transaction });
        }
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
        function logAction(status) {
            logger.info(`Update Department`, {
                "1.username": username,
                "2.module": "updateDepartment",
                "3.status": status,
                "4.action": req.body
            });
        }
    } catch (error) {
        await transaction.rollback();
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
                data: []
            });
        } else {
            res.status(404).json({
                message: error.message
            });
        }
    }
}
module.exports = controller;