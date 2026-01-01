const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectBankAccount = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;

        const selectBankAccountData = await selectBankAccount()
        if (selectBankAccountData === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        await sendSuccessResponse(messages[language]?.successfulData, selectBankAccountData);

        async function selectBankAccount() {
            return await model.fat_account_bank.findAll({
                include: [
                    {
                        model: model.adm_company,
                        attributes: ["name"]
                    },
                    {
                        model: model.fat_coa,
                        include: {
                            model: model.fat_coa_translations,
                            attributes: ["language_code", "translation"],
                            where: {
                                language_code: language
                            },
                        },
                        attributes: ["code_coa"],
                    },
                ],
                order: [
                    ['code_company', 'ASC'],
                    ['bank_account_number', 'ASC'],
                ],
            });
        }

        async function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data && { data })
            });
        }

        async function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
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
controller.selectBankAccountByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            account_number_POST: accountNumber,
        } = requestData;

        const selectBankAccountByCodeData = await selectBankAccountByCode()
        if (selectBankAccountByCodeData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectBankAccountByCodeData);
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

        async function selectBankAccountByCode() {
            return await model.fat_account_bank.findAll({
                include: [
                    {
                        model: model.adm_company,
                        attributes: ["name"]
                    },
                    {
                        model: model.fat_coa,
                        include: {
                            model: model.fat_coa_translations,
                            attributes: ["language_code", "translation"],
                            where: {
                                language_code: language
                            },
                        },
                        attributes: ["code_coa"],
                    },
                ],
                where: {
                    bank_account_number: accountNumber
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
controller.insertBankAccount = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            username_POST: username,
            company_code_POST: companyCode,
            code_coa_POST: codeCOA,
            account_number_POST: accountNumber,
            name_bank_POST: nameBank,
            currency_POST: currency,
            branch_POST: branch,
            status_POST: status,

        } = requestData;


        const validationBankAccountData = await validationBankAccount();
        if (validationBankAccountData.length > 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.duplicateData);
        }
        const insertBankAccountData = await insertBankAccount();
        if (!insertBankAccountData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData, insertBankAccountData);
        logAction('success');

        async function validationBankAccount() {
            return await model.fat_account_bank.findAll({
                where: {
                    bank_account_number: accountNumber,
                },
                transaction
            });
        }
        async function insertBankAccount() {
            return await model.fat_account_bank.create({
                bank_account_number: accountNumber,
                code_company: companyCode,
                code_coa: codeCOA,
                bank: nameBank,
                branch: branch,
                currencies: currency,
                status: status
            }, { transaction });
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
            logger.info(`Insert Bank Account`, {
                "1.username": username,
                "2.module": "insertBankAccount",
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
    }


};
controller.updateBankAccount = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            username_POST: username,
            company_code_POST: companyCode,
            code_coa_POST: codeCOA,
            account_number_POST: accountNumber,
            name_bank_POST: nameBank,
            currency_POST: currency,
            branch_POST: branch,
            status_POST: status,

        } = requestData;
        const updateBankAccountData = await updateBankAccount()
        if (!updateBankAccountData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData, updateBankAccountData);
        logAction('success');

        async function updateBankAccount() {
            return await model.fat_account_bank.update(
                {
                    code_company: companyCode,
                    code_coa: codeCOA,
                    bank: nameBank,
                    branch: branch,
                    currencies: currency,
                    status: status
                },
                {
                    where:
                    {
                        bank_account_number: accountNumber,
                    },
                    transaction,
                },
            );
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
            logger.info(`Update Bank Account`, {
                "1.username": username,
                "2.module": "updateBankAccount",
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
controller.selectBankAccountByCompany = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            company_code_POST: companyCode,
            code_coa_POST: codeCoa,
        } = requestData;

        const selectBankAccountData = await selectBankAccount()
        if (selectBankAccountData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectBankAccountData);
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

        async function selectBankAccount() {
            return await model.fat_account_bank.findAll({
                include: [
                    {
                        model: model.adm_company,
                        attributes: ["name"]
                    },
                    {
                        model: model.fat_coa,
                        include: {
                            model: model.fat_coa_translations,
                            attributes: ["language_code", "translation"],
                            where: {
                                language_code: language
                            },
                        },
                        attributes: ["code_coa"],
                    },
                ],
                where: {
                    [Op.and]: [
                        {
                            code_company: companyCode
                        },
                        {
                            code_coa: codeCoa
                        },
                        {
                            status: 1
                        }
                    ]

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