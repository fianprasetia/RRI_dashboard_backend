const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectVoucherType = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;

        const selectVoucherTypeData = await selectVoucherType()
        if (!selectVoucherTypeData) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.insertData, selectVoucherTypeData);
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

        async function selectVoucherType() {
            const data = await model.fat_payment_voucher_type.findAll({
                include: [
                    {
                        model: model.fat_payment_voucher_type_translations,
                        attributes: ["language_code", "translation"],
                        where: {
                            language_code: language
                        },
                        as: 'translations'
                    },
                ],
                order: [
                    ['code_payment_voucher_type', 'ASC'],
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
controller.selectVoucherTypeByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            code_payment_voucher_type_POST: codeVoucher,
        } = requestData;

        const selectVoucherTypeByCodeData = await selectVoucherTypeByCode()
        if (!selectVoucherTypeByCodeData) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectVoucherTypeByCodeData);
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

        async function selectVoucherTypeByCode() {
            return await model.fat_payment_voucher_type.findAll({
                include: [
                    {
                        model: model.fat_payment_voucher_type_translations,
                        attributes: ["language_code", "translation"],
                        as: 'translations'
                    },
                ],
                where: {
                    code_payment_voucher_type: codeVoucher
                },
                order: [
                    ['code_payment_voucher_type', 'ASC'],
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
controller.insertVoucherType = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            code_payment_voucher_type_POST: codeVouhcerType,
            detail: details
        } = requestData;

        const isDuplicate = await checkDuplicateVoucherType();
        if (isDuplicate) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.duplicateData);
        }

        const languageData = await selectLanguage();

        const voucherType = await insertVoucherType();
        if (!voucherType) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await insertVoucherTypeTranslations(languageData);

        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');

        async function checkDuplicateVoucherType() {
            const existing = await model.fat_payment_voucher_type.findOne({
                where: { code_payment_voucher_type: codeVouhcerType },
                transaction
            });
            return !!existing;
        }

        async function selectLanguage() {
            return await model.adm_language.findAll({
                order: [['language_code', 'ASC']],
                transaction
            });
        }

        async function insertVoucherType() {
            return await model.fat_payment_voucher_type.create({
                code_payment_voucher_type: codeVouhcerType,
                descriptions: details[0].language_POST,
            }, { transaction });
        }

        async function insertVoucherTypeTranslations(languageData) {
            const rowsToInsert = details.map((detail, i) => ({
                code_payment_voucher_type: codeVouhcerType,
                language_code: languageData[i]?.language_code,
                translation: detail.language_POST
            }));
            await model.fat_payment_voucher_type_translations.bulkCreate(rowsToInsert, { transaction });
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
            logger.info(`Insert Payment Voucher Type`, {
                "1.username": username,
                "2.module": "insertVoucherType",
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
controller.updateVoucherType = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            code_payment_voucher_type_POST: codeVouhcerType,
            detail: details
        } = requestData;

        const updateVoucherTypeData = await updateVoucherType()
        if (!updateVoucherTypeData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const languageData = await selectLanguage()

        const deleteVoucherTypeData = await deleteVoucherType()
        if (!deleteVoucherTypeData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const insertVoucherTypeTranslationsData = await insertVoucherTypeTranslations(languageData)
        if (!insertVoucherTypeTranslationsData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData, insertVoucherTypeTranslationsData);
        logAction('success');

        async function updateVoucherType() {
            var languageMenu = details[0]["language_POST"]
            return await model.fat_payment_voucher_type.update(
                {
                    descriptions: languageMenu,
                },
                {
                    where:
                    {
                        code_payment_voucher_type: codeVouhcerType,
                    },
                    transaction,
                },
            );
        }
        async function deleteVoucherType() {
            return await model.fat_payment_voucher_type_translations.destroy({
                where: {
                    code_payment_voucher_type: codeVouhcerType,
                },
                transaction: transaction
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
        async function insertVoucherTypeTranslations(languageData) {
            const rowsToInsert = details.map((detail, i) => ({
                code_payment_voucher_type: codeVouhcerType,
                language_code: languageData[i]?.language_code,
                translation: detail.language_POST
            }));
            return await model.fat_payment_voucher_type_translations.bulkCreate(rowsToInsert, { transaction });
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
            logger.info(`Update Payment Voucher Type`, {
                "1.username": username,
                "2.module": "updateVoucherType",
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