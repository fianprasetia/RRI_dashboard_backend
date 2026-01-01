const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectTransactionUnposting = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;

        const selectTransactionUnpostingData = await selectTransactionUnposting()
        if (selectTransactionUnpostingData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        await sendSuccessResponse(messages[language]?.successfulData, selectTransactionUnpostingData);

        async function selectTransactionUnposting() {
            return await model.fat_transaction_unposting.findAll({
                include:
                    [
                        {
                            model: model.fat_transaction_unposting_translations,
                            attributes: ["language_code", "translation"],
                            where: {
                                language_code: language
                            },
                            as: "translations"
                        },
                    ],
                order: [
                    ['code_transaction_unposting', 'ASC'],
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
controller.selectTransactionUnpostingBypaymentVoucher = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            no_transaction_POST: code,
        } = requestData;

        const selectPaymentVoucherData = await selectPaymentVoucher()
        if (selectPaymentVoucherData.length === 0 || selectPaymentVoucherData == []) {
            return sendFailedResponse(messages[language]?.nodata);
        }
        const selectAccountingPeriodsData = await selectAccountingPeriods(selectPaymentVoucherData)
        if (selectAccountingPeriodsData.length != 0) {
            return sendFailedResponse(messages[language]?.outOfPeriod);
        }
        const selectCashBankData = await selectCashBank()
        if (selectCashBankData.length != 0) {
            let codeCashBank = selectCashBankData[0]["code_cash_bank"]
            return sendFailedResponse(messages[language]?.paymentVoucherCashbak.replace("{{codepayment}}", `${code}`).replace("{{codecashbank}}", `${codeCashBank}`));
        }
        // const updateBalanceMonthlyData = await updateBalanceMonthly(selectPaymentVoucherData)

        await sendSuccessResponse(messages[language]?.successfulData, selectPaymentVoucherData);

        async function selectPaymentVoucher() {
            return await model.fat_payment_voucher.findAll({
                include: [
                    {
                        model: model.fat_payment_voucher_detail,
                        include:
                            [
                                {
                                    model: model.fat_coa,
                                    include:
                                        [
                                            {
                                                model: model.fat_coa_translations,
                                                attributes: ["language_code", "translation"],
                                                where: {
                                                    language_code: language
                                                },
                                            },
                                        ],
                                },
                                {
                                    model: model.hrd_department,
                                    include:
                                        [
                                            {
                                                model: model.hrd_department_translations,
                                                attributes: ["language_code", "translation"],
                                                where: {
                                                    language_code: language
                                                },
                                            },
                                        ],
                                    as: "department"
                                },
                            ],
                        as: "details"
                    },
                    {
                        model: model.fat_payment_voucher_type,
                        attributes: ["code_payment_voucher_type"],
                        include:
                            [
                                {
                                    model: model.fat_payment_voucher_type_translations,
                                    attributes: ["language_code", "translation"],
                                    where: {
                                        language_code: language
                                    },
                                    as: "translations"
                                },
                            ],
                    },
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
                    },
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
                        as: "company"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeCreate"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeUpdate"
                    },
                    {
                        model: model.log_partners,
                        attributes: ["code_partners", "name"],
                        include: [
                            {
                                model: model.log_partners_type
                            }
                        ]
                    },
                ],
                where: {
                    [Op.and]: [
                        {
                            code_payment_voucher: code
                        },
                        {
                            status: {
                                [Op.notIn]: [0, 3]
                            },
                        },
                    ]
                },
            });
        }
        async function selectAccountingPeriods(selectPaymentVoucherData) {
            let worksite = selectPaymentVoucherData[0]["worksite"]
            let createDate = selectPaymentVoucherData[0]["date_create"]
            let yearAndMonth = createDate.split("-").slice(0, 2).join("-");
            return await model.fat_accounting_periods.findAll({
                where:
                {
                    [Op.and]: [
                        {
                            code_company: worksite
                        },
                        { status: 1 },
                        { period: yearAndMonth },
                    ]
                },

            });
        }
        async function selectCashBank() {
            return await model.fat_cash_bank_detail.findAll({
                where: {
                    [Op.and]: [
                        {
                            code_transactions: code
                        },
                        {
                            status: {
                                [Op.notIn]: [0, 2]
                            },
                        },
                    ]
                },
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
controller.updateTransactionUnpostingBypaymentVoucher = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            username_POST: username,
            no_transaction_POST: code,
        } = requestData;

        const selectJournalData = await selectJournal()
        if (selectJournalData.length === 0 || selectJournalData == []) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata + "selectJournalData");
        }
        const updateBalanceMonthlyData = await updateBalanceMonthly(selectJournalData)
        if (!updateBalanceMonthlyData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.unpostingCorrect + "updateBalanceMonthlyData");
        }
        const deleteJournalData = await deleteJournal()
        if (!deleteJournalData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.unpostingCorrect + " deleteJournalData");
        }
        const updatePaymentVoucherData = await updatePaymentVoucher()
        if (!updatePaymentVoucherData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.unpostingCorrect + "updatePaymentVoucherData");
        }
        const updatePaymentVoucherDetailData = await updatePaymentVoucherDetail()
        if (!updatePaymentVoucherDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.unpostingCorrect + "updatePaymentVoucherDetailData");
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.unpostingData);
        logAction('success');

        async function selectJournal() {
            return await model.fat_journal.findAll({
                where:
                {
                    reference_code: code
                },

            });
        }
        async function updateBalanceMonthly(selectJournalData) {
            const { code_company, worksite } = selectJournalData[0];
            const date = new Date(selectJournalData[0].date);
            const periodDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            const results = [];
            for (const entry of selectJournalData) {
                const amount = entry.amount;
                const updateData = {
                    [entry.dk_code === "D" ? "debit" : "credit"]: Sequelize.literal(
                        `${entry.dk_code === "D" ? "debit" : "credit"} - ${amount}`
                    )
                };

                const updateResult = await model.fat_balance_monthly.update(updateData, {
                    where: {
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: periodDate
                    },
                    transaction
                });
                results.push(updateResult);
            }

            return results;
        }
        async function deleteJournal() {
            return await model.fat_journal.destroy({
                where: {
                    reference_code: code
                },
                transaction
            });
        }
        async function updatePaymentVoucher() {
            return await model.fat_payment_voucher.update(
                {
                    status: 0,
                },
                {
                    where:
                    {
                        code_payment_voucher: code,
                    },
                    transaction,
                },
            );
        }
        async function updatePaymentVoucherDetail() {
            return await model.fat_payment_voucher_detail.update(
                {
                    status: 0,
                },
                {
                    where:
                    {
                        code_payment_voucher: code,

                    },
                    transaction,
                },
            );
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
        function logAction(status) {
            logger.info(`Unposting Payment Voucher`, {
                "1.username": username,
                "2.module": "updateTransactionUnpostingBypaymentVoucher",
                "3.status": status,
                "4.action": req.body
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
controller.selectTransactionUnpostingByCashBank = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            no_transaction_POST: code,
        } = requestData;

        const selectCashBankData = await selectCashBank()
        if (selectCashBankData.length === 0 || selectCashBankData == []) {
            return sendFailedResponse(messages[language]?.nodata);
        }
        const selectAccountingPeriodsData = await selectAccountingPeriods(selectCashBankData)
        if (selectAccountingPeriodsData.length != 0) {
            return sendFailedResponse(messages[language]?.outOfPeriod);
        }
        await sendSuccessResponse(messages[language]?.successfulData, selectCashBankData);

        async function selectCashBank() {
            return await model.fat_cash_bank.findAll({
                include: [
                    {
                        model: model.fat_cash_bank_detail,
                        include: [
                            {
                                model: model.fat_coa,
                                attributes: ["code_coa"],
                                include:
                                    [
                                        {
                                            model: model.fat_coa_translations,
                                            attributes: ["language_code", "translation"],
                                            where: {
                                                language_code: language
                                            },
                                        },
                                    ],
                            },
                            {
                                model: model.hrd_employee,
                                attributes: ["fullname"]
                            },
                            {
                                model: model.log_partners,
                                attributes: ["code_partners", "name"],
                            },
                        ],
                        as: "details"
                    },
                    {
                        model: model.fat_account_bank,
                    },
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
                    },
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
                        as: "WorksiteCompany"
                    },
                    {
                        model: model.fat_coa,
                        include:
                            [
                                {
                                    model: model.fat_coa_translations,
                                    attributes: ["language_code", "translation"],
                                    where: {
                                        language_code: language
                                    },
                                },
                            ],
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeCreate"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeUpdate"
                    },
                ],
                where: {
                    [Op.and]: [
                        {
                            code_cash_bank: code
                        },
                        {
                            status: {
                                [Op.notIn]: [0, 2]
                            },
                        },
                    ]
                },
            });
        }
        async function selectAccountingPeriods(selectCashBankData) {
            let worksite = selectCashBankData[0]["worksite"]
            let createDate = selectCashBankData[0]["date_create"]
            let yearAndMonth = createDate.split("-").slice(0, 2).join("-");
            return await model.fat_accounting_periods.findAll({
                where:
                {
                    [Op.and]: [
                        {
                            code_company: worksite
                        },
                        { status: 1 },
                        { period: yearAndMonth },
                    ]
                },

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
controller.updateTransactionUnpostingByCashBank = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            username_POST: username,
            no_transaction_POST: code,
        } = requestData;
        const selectJournalData = await selectJournal()
        if (selectJournalData.length === 0 || selectJournalData == []) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata + "selectJournalData");
        }
        const updateBalanceMonthlyData = await updateBalanceMonthly(selectJournalData)
        if (!updateBalanceMonthlyData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.unpostingCorrect + "-updateBalanceMonthlyData");
        }
        const deleteJournalData = await deleteJournal()
        if (!deleteJournalData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.unpostingCorrect + "-deleteJournalData");
        }
        const updateCashBankData = await updateCashBank()
        if (!updateCashBankData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.unpostingCorrect + "-updateCashBankData");
        }
        const updateCashBankDetailData = await updateCashBankDetail()
        if (!updateCashBankDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.unpostingCorrect + "-updateCashBankDetailData");
        }
        const selectCashBankData = await selectCashBank()
        if (selectCashBankData.length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata + "-selectCashBankData");
        }
        await updatePaymentVoucher(selectCashBankData)
        await updatePaymentVoucherDetail(selectCashBankData)
        await selectPaymentVoucher(selectCashBankData)

        await transaction.commit();
        sendSuccessResponse(messages[language]?.unpostingData);
        logAction('success');

        async function selectJournal() {
            return await model.fat_journal.findAll({
                where:
                {
                    reference_code: code
                },

            });
        }
        async function updateBalanceMonthly(selectJournalData) {
            const { code_company, worksite } = selectJournalData[0];
            const date = new Date(selectJournalData[0].date);
            const periodDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            const results = [];
            for (const entry of selectJournalData) {
                const amount = entry.amount;
                const updateData = {
                    [entry.dk_code === "D" ? "debit" : "credit"]: Sequelize.literal(
                        `${entry.dk_code === "D" ? "debit" : "credit"} - ${amount}`
                    )
                };

                const updateResult = await model.fat_balance_monthly.update(updateData, {
                    where: {
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: periodDate
                    },
                    transaction
                });
                results.push(updateResult);
            }

            return results;
        }
        async function deleteJournal() {
            return await model.fat_journal.destroy({
                where: {
                    reference_code: code
                },
                transaction
            });
        }
        async function updateCashBank() {
            return await model.fat_cash_bank.update(
                {
                    status: 0,
                },
                {
                    where:
                    {
                        code_cash_bank: code,
                    },
                    transaction,
                },
            );
        }
        async function updateCashBankDetail() {
            return await model.fat_cash_bank_detail.update(
                {
                    status: 0,
                },
                {
                    where:
                    {
                        code_cash_bank: code,

                    },
                    transaction,
                },
            );
        }
        async function selectCashBank() {
            return await model.fat_cash_bank.findAll({
                include: [
                    {
                        model: model.fat_cash_bank_detail,
                        as: "details"
                    },
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
                    },
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
                        as: "WorksiteCompany"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeCreate"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeUpdate"
                    },
                ],
                where: {
                    code_cash_bank: code
                },
            });
        }
        async function updatePaymentVoucher(selectCashBankData) {
            const { details } = selectCashBankData[0];
            for (const entry of details) {
                await model.fat_payment_voucher.update(
                    {
                        status: 1,
                    },
                    {
                        where:
                        {
                            code_payment_voucher: entry.code_transactions,
                        },
                        transaction,
                    },
                );
            }
        }
        async function updatePaymentVoucherDetail(selectCashBankData) {
            const { details } = selectCashBankData[0];
            for (const entry of details) {
                await model.fat_payment_voucher_detail.update(
                    {
                        status: 1,
                    },
                    {
                        where:
                        {
                            [Op.and]: [
                                {
                                    code_payment_voucher: entry.code_transactions,
                                },
                                {
                                    code_coa: entry.code_coa
                                }
                            ]
                        },
                        transaction,
                    },
                );
            }
        }
        async function selectPaymentVoucher(selectCashBankData) {
            const { details } = selectCashBankData[0];
            let paymentVoucherEntries = []
            const totalAmount = details.reduce((sum, item) => sum + item.amount, 0);
            for (const entry of details) {
                paymentVoucherEntries = await model.fat_payment_voucher.findAll({
                    where:
                    {
                        code_payment_voucher: entry.code_transactions

                    },
                    transaction
                });
            }

            for (const entry of paymentVoucherEntries) {
                if (entry.code_payment_voucher_type === "DP" || entry.code_payment_voucher_type === "PO") {
                    let selectPurchaseOrderData = await model.log_purchase_order.findAll({
                        where:
                        {
                            code_purchase_order: entry.no_transaction

                        },
                        transaction
                    });
                    const totalAmountPO = selectPurchaseOrderData[0]["remaining_subtotal"]
                    const selisih = totalAmountPO + totalAmount;
                    // const updateData = ""
                    // if (selisih <= 0) {
                    //     updateData = {
                    //         [Op.and]: [
                    //             {
                    //                 status: 3,
                    //             },
                    //             {
                    //                 remaining_subtotal: selisih
                    //             }
                    //         ]
                    //     }
                    // } else {
                    //     updateData = {
                    //         remaining_subtotal: selisih
                    //     }
                    // }
                    const updateData = selisih <= 0 ? { status: 3, remaining_subtotal: selisih } : { remaining_subtotal: selisih };
                    await model.log_purchase_order.update(
                        updateData,
                        {
                            where:
                            {
                                code_purchase_order: entry.no_transaction,
                            },
                            transaction,
                        },
                    );
                }
            }
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
        function logAction(status) {
            logger.info(`Unposting Cash Bank`, {
                "1.username": username,
                "2.module": "updateTransactionUnpostingByCashBank",
                "3.status": status,
                "4.action": req.body
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