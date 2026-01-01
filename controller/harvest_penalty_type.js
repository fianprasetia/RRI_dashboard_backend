const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectHarvestPenaltyType = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;

        const selectHarvestPenaltyTypeData = await selectHarvestPenaltyType()
        if (!selectHarvestPenaltyTypeData) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.insertData, selectHarvestPenaltyTypeData);

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

        async function selectHarvestPenaltyType() {
            const data = await model.plt_harvest_penalty_type.findAll({
                include: [
                    {
                        model: model.plt_harvest_penalty_type_translations,
                        attributes: ["language_code", "translation"],
                        where: {
                            language_code: language
                        },
                        as: 'translations'
                    },
                ],
                order: [
                    ['code_harvest_penalty', 'ASC'],
                ],
            });
            return data;
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
}
controller.selectHarvestPenaltyTypeByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            code_harvest_penalty_POST: codeHarvestPenaltyType,
        } = requestData;

        const selectHarvestPenaltyTypeByCodeData = await selectHarvestPenaltyTypeByCode()
        if (selectHarvestPenaltyTypeByCodeData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectHarvestPenaltyTypeByCodeData);
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

        async function selectHarvestPenaltyTypeByCode() {
            return await model.plt_harvest_penalty_type.findAll({
                include: [
                    {
                        model: model.plt_harvest_penalty_type_translations,
                        attributes: ["language_code", "translation"],
                        as: 'translations'
                    },
                ],
                where: {
                    code_harvest_penalty: codeHarvestPenaltyType
                },
                order: [
                    ['code_harvest_penalty', 'ASC'],
                ],
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
controller.insertHarvestPenaltyType = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            detail: details
        } = requestData;

        const newCode = await generateCode();
        const languageData = await selectLanguage();

        const insertHarvestPenaltyTypeData = await insertHarvestPenaltyType(newCode);
        if (!insertHarvestPenaltyTypeData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await insertHarvestPenaltyTypeTranslations(newCode, languageData);

        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');

        async function generateCode() {
            const existingCode = await model.plt_harvest_penalty_type.findAll({
                transaction
            });

            let sequenceNumber;
            if (existingCode.length > 0) {
                const maxCode = Math.max(...existingCode.map(code =>
                    parseInt(code.code_harvest_penalty.replace(/^\D+/g, ''))
                ));
                sequenceNumber = (maxCode + 1).toString().padStart(2, "0");
            } else {
                sequenceNumber = "01";
            }

            return `DP${sequenceNumber}`;
        }

        async function selectLanguage() {
            return await model.adm_language.findAll({
                order: [['language_code', 'ASC']],
                transaction
            });
        }

        async function insertHarvestPenaltyType() {
            return await model.plt_harvest_penalty_type.create({
                code_harvest_penalty: newCode,
                descriptions: details[0].language_POST,
            }, { transaction });
        }

        async function insertHarvestPenaltyTypeTranslations(newCode, languageData) {
            const rowsToInsert = details.map((detail, i) => ({
                code_harvest_penalty: newCode,
                language_code: languageData[i]?.language_code,
                translation: detail.language_POST
            }));
            await model.plt_harvest_penalty_type_translations.bulkCreate(rowsToInsert, { transaction });
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
            logger.info(`Insert Harvest Penalty Type`, {
                "1.username": username,
                "2.module": "insertHarvestPenaltyType",
                "3.status": status,
                "4.action": req.body
            });
        }
    } catch (error) {
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.error('Rollback error:', rollbackError);
        }

        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
        logAction('failed');
    }


};
controller.updateHarvestPenaltyType = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            code_harvest_penalty_POST: codeHarvestPenaltyType,
            detail: details
        } = requestData;

        const updateHarvestPenaltyTypeData = await updateHarvestPenaltyType()
        if (!updateHarvestPenaltyTypeData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const languageData = await selectLanguage()

        const deleteHarvestPenaltyTypeData = await deleteHarvestPenaltyType()
        if (!deleteHarvestPenaltyTypeData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const insertHarvestPenaltyTypeTranslationsData = await insertHarvestPenaltyTypeTranslations(languageData)
        if (!insertHarvestPenaltyTypeTranslationsData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData, insertHarvestPenaltyTypeTranslationsData);
        logAction('success');

        async function updateHarvestPenaltyType() {
            var languageMenu = details[0]["language_POST"]
            return await model.plt_harvest_penalty_type.update(
                {
                    descriptions: languageMenu,
                },
                {
                    where:
                    {
                        code_harvest_penalty: codeHarvestPenaltyType,
                    },
                    transaction,
                },
            );
        }
        async function deleteHarvestPenaltyType() {
            return await model.plt_harvest_penalty_type_translations.destroy({
                where: {
                    code_harvest_penalty: codeHarvestPenaltyType,
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
        async function insertHarvestPenaltyTypeTranslations(languageData) {
            const rowsToInsert = details.map((detail, i) => ({
                code_harvest_penalty: codeHarvestPenaltyType,
                language_code: languageData[i]?.language_code,
                translation: detail.language_POST
            }));
            return await model.plt_harvest_penalty_type_translations.bulkCreate(rowsToInsert, { transaction });
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
            logger.info(`Update Harvest Penalty Type`, {
                "1.username": username,
                "2.module": "updateHarvestPenaltyType",
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