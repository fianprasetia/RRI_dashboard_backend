const model = require("../models/index")
const messages = require("./message")
const eppsLib = require('./epps');
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json, col } = require("sequelize")
const logger = require('./logger');

controller.selectAccountingPeriods = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            worksite_POST: worksite,
        } = requestData;

        const selectAccountingPeriodsData = await selectAccountingPeriods()
        if (selectAccountingPeriodsData === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectAccountingPeriodsData);
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

        async function selectAccountingPeriods() {
            return await model.fat_accounting_periods.findAll({
                // include: [
                //     {
                //         model: model.adm_company,
                //         // attributes: ["language_code", "translation"],
                //         // where: {
                //         //     language_code: language
                //         // },
                //     },
                // ],
                where:
                {
                    [Op.and]: [
                        {
                            code_company: worksite
                        },
                        { status: 0 }
                    ]
                },
                order: [
                    ['period', 'ASC'],
                ],
                limit: 1

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
controller.selectAccountingPeriodsOpen = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            worksite_POST: worksite,
        } = requestData;

        const selectAccountingPeriodsData = await selectAccountingPeriods()
        if (selectAccountingPeriodsData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectAccountingPeriodsData);
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

        async function selectAccountingPeriods() {
            return await model.fat_accounting_periods.findAll({
                // include: [
                //     {
                //         model: model.adm_company,
                //         // attributes: ["language_code", "translation"],
                //         // where: {
                //         //     language_code: language
                //         // },
                //     },
                // ],
                where:
                {
                    [Op.and]: [
                        {
                            code_company: worksite
                        },
                        { status: 1 }
                    ]
                },
                order: [
                    ['period', 'DESC'],
                ],
                limit: 1

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
controller.updateAccountingPerodsClose = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const {
            language_POST: language,
            username_POST: username,
            worksite_POST: worksite,
            company_POST: code_company,
            period_POST: period,
        } = req.body;

        const selectCashBankData = await selectCashBank();
        if (selectCashBankData.length > 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.incomplateCashBank);
        }
        const selectCompanyData = await selectCompany();
        if (selectCompanyData.length == 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata + " selectCompanyData");
        }
        const selectPreClosingPeriodData = await selectPreClosingPeriod();
        if (selectPreClosingPeriodData.length == 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.beforeClosingPeriod);
        }
        const selectAccountPeriodsData = await selectAccountPeriods(selectCompanyData);
        if (selectAccountPeriodsData.length > 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.closingPeriodFailed.replace("{{location}}", `${selectAccountPeriodsData[0]["code_company"]}`));
        }
        const selectBalanceMonthlyData = await selectBalanceMonthly();
        if (selectBalanceMonthlyData.length == 0) {
            await updateAccountingPeriods();
            // await transaction.rollback();
            // return sendFailedResponse(messages[language]?.nodata + " selectBalanceMonthlyData");
        }
        const monthNow = period.split("-")[1];
        if (monthNow == "12") {
            await updateBalanceMonthlyClosing(selectBalanceMonthlyData);
        } else {
            await updateBalanceMonthly(selectBalanceMonthlyData);
        }
        const updateAccountingPeriodsData = await updateAccountingPeriods();
        if (!updateAccountingPeriodsData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const updateBalanceMonthlyStatusData = await updateBalanceMonthlyStatus();
        if (!updateBalanceMonthlyStatusData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.closePeriodMonthly.replace("{{period}}", period));
        logAction('success');

        async function selectCashBank() {
            return await model.fat_cash_bank.findAll({
                where: {
                    worksite: worksite,
                    [Op.and]: [
                        sequelize.where(
                            sequelize.cast(col('date_create'), 'text'),
                            { [Op.like]: `${period}%` }
                        )
                    ],
                    status: 0
                },
                transaction
            });
        }
        async function selectPreClosingPeriod() {
            return await model.fat_pre_closing_period.findAll({
                where: {
                    [Op.and]:
                        [
                            {
                                code_company: worksite
                            },
                            {
                                period: period
                            }
                        ]
                },
            });
        }
        async function selectCompany() {
            companyData = await model.adm_company.findAll({
                where: {
                    code_company: worksite
                },
                transaction
            });
            let type = companyData[0]["code_company_type"]
            let companyCode = companyData[0]["code_company"]
            let parentCode = companyData[0]["parent_code"]
            if (type == "Head") {
                location = {
                    [Op.and]: [
                        {
                            parent_code: {
                                [Op.in]: [parentCode, worksite]
                            }

                        },
                        {
                            code_company: {
                                [Op.notIn]: [worksite]
                            },
                        }
                    ]
                }
            } else {
                location = {
                    parent_code: companyCode
                }
            }
            return await model.adm_company.findAll({
                attributes: ["code_company"],
                where: location,
                order: ["code_company"],
                transaction
            });
        }
        async function selectAccountPeriods(selectCompanyData) {
            var dataList = [];
            for (var i = 0; i < selectCompanyData.length; i++)
                dataList.push(selectCompanyData[i]["code_company"]);
            return await model.fat_accounting_periods.findAll({
                attributes: ["code_company"],
                where: {
                    [Op.and]: [
                        { code_company: dataList },
                        { period: period },
                        { status: 0 },
                    ]
                },
                transaction
            });
        }
        async function selectBalanceMonthly() {
            return await model.fat_balance_monthly.findAll({
                where: {
                    worksite,
                    period_date: period,
                },
                transaction
            });
        }
        async function updateBalanceMonthly(selectBalanceMonthlyData) {
            const [year, month] = period.split("-").map(Number);
            const date = new Date(year, month)
            const nextMonthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            for (const entry of selectBalanceMonthlyData) {
                var existingBalance = await model.fat_balance_monthly.findOne({
                    where: {
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: nextMonthStr,
                    },
                    transaction
                });
                const amount = entry.opening_balance + entry.debit - entry.credit;
                const updateData = {
                    opening_balance: amount
                };
                if (existingBalance) {
                    var updateResult = await model.fat_balance_monthly.update(updateData, {
                        where: {
                            code_company,
                            worksite,
                            code_coa: entry.code_coa,
                            period_date: nextMonthStr
                        },
                        transaction
                    });
                } else {
                    var createdRecord = await model.fat_balance_monthly.create({
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: nextMonthStr,
                        opening_balance: amount,
                        debit: 0,
                        credit: 0,
                        status: 0
                    }, { transaction });
                }


            }
        }
        async function updateBalanceMonthlyClosing(selectBalanceMonthlyData) {
            const [year, month] = period.split("-").map(Number);
            const date = new Date(year, month);
            const nextMonthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            for (const entry of selectBalanceMonthlyData) {
                const existingBalance = await model.fat_balance_monthly.findAll({
                    where: {
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: nextMonthStr
                    },
                    transaction
                });

                const prefixes = ["61101", "61201", "62101", "71201", "71202", "72101"];

                const profitLossItems = existingBalance.filter(item => prefixes.some(prefix => item.code_coa.startsWith(prefix)));

                const notProfitLossItems = existingBalance.filter(item => prefixes.every(prefix => !item.code_coa.startsWith(prefix)));

                const amountTotalProfitLoss = profitLossItems.reduce((total, item) => total + (Number(item.opening_balance) + Number(item.debit) - Number(item.credit)), 0);

                const labaDitahan = await model.fat_balance_monthly.findOne({
                    where: {
                        code_company,
                        worksite,
                        code_coa: "33101001",
                        period_date: nextMonthStr
                    },
                    transaction
                });

                if (labaDitahan) {
                    await model.fat_balance_monthly.update(
                        { opening_balance: amountTotalProfitLoss },
                        {
                            where: {
                                code_company,
                                worksite,
                                code_coa: "33101001",
                                period_date: nextMonthStr
                            },
                            transaction
                        }
                    );
                } else {
                    await model.fat_balance_monthly.create({
                        code_company,
                        worksite,
                        code_coa: "33101001",
                        period_date: nextMonthStr,
                        opening_balance: amountTotalProfitLoss,
                        debit: 0,
                        credit: 0,
                        status: 0
                    }, { transaction });
                }
                for (const item of profitLossItems) {
                    await model.fat_balance_monthly.update(
                        { opening_balance: 0 },
                        {
                            where: {
                                code_company,
                                worksite,
                                code_coa: item.code_coa,
                                period_date: nextMonthStr
                            },
                            transaction
                        }
                    );
                }
                // const updateData = {
                //     opening_balance: amountTotalProfitLoss
                // };

                // if (profitLossItems.length > 0) {
                //     await model.fat_balance_monthly.update(updateData, {
                //         where: {
                //             code_company,
                //             worksite,
                //             code_coa: "33101001",
                //             period_date: nextMonthStr
                //         },
                //         transaction
                //     });
                //     await model.fat_balance_monthly.update(
                //         {
                //             opening_balance: 0
                //         },
                //         {
                //             where: {
                //                 code_company,
                //                 worksite,
                //                 code_coa: profitLossItems.code_coa,
                //                 period_date: nextMonthStr
                //             },
                //             transaction
                //         });
                // } else {
                //     await model.fat_balance_monthly.create({
                //         code_company,
                //         worksite,
                //         code_coa: "33101001",
                //         period_date: nextMonthStr,
                //         opening_balance: amountTotalProfitLoss,
                //         debit: 0,
                //         credit: 0,
                //         status: 0
                //     }, { transaction });
                //     await model.fat_balance_monthly.create({
                //         code_company,
                //         worksite,
                //         code_coa: profitLossItems.code_coa,,
                //         period_date: nextMonthStr,
                //         opening_balance: 0,
                //         debit: 0,
                //         credit: 0,
                //         status: 0
                //     }, { transaction });
                // }
                const notProfitLossData = notProfitLossItems.map(item => ({
                    code_coa: item.code_coa,
                    opening_balance: item.opening_balance,
                    debit: item.debit,
                    credit: item.credit,
                    amount: item.opening_balance + item.debit - item.credit
                }));
                for (const entry of notProfitLossData) {
                    const updateDatanot = {
                        opening_balance: entry.amount
                    };

                    const existingRecord = await model.fat_balance_monthly.findOne({
                        where: {
                            code_company,
                            worksite,
                            code_coa: entry.code_coa,
                            period_date: nextMonthStr
                        },
                        transaction
                    });

                    if (existingRecord) {
                        await model.fat_balance_monthly.update(updateDatanot, {
                            where: {
                                code_company,
                                worksite,
                                code_coa: entry.code_coa,
                                period_date: nextMonthStr
                            },
                            transaction
                        });
                    } else {
                        await model.fat_balance_monthly.create({
                            code_company,
                            worksite,
                            code_coa: entry.code_coa,
                            period_date: nextMonthStr,
                            opening_balance: entry.amount,
                            debit: 0,
                            credit: 0,
                            status: 0
                        }, { transaction });
                    }
                }
            }
        }
        async function updateBalanceMonthlyStatus() {
            return await model.fat_balance_monthly.update(
                {
                    status: 1
                },
                {
                    where: {
                        code_company,
                        worksite,
                        period_date: period
                    },
                    transaction
                });
        }
        async function updateAccountingPeriods() {
            // First update the current period status to closed (1)
            await model.fat_accounting_periods.update(
                { status: 1 },
                {
                    where: {
                        [Op.and]: [
                            { period: period },
                            { code_company: worksite },
                        ]
                    },
                    transaction
                }
            );

            // Calculate the next period
            const [y, m] = period.split('-').map(Number);
            const d = new Date(y, m - 1);
            d.setMonth(d.getMonth() + 1);
            const periodNew = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const rangerMonth = eppsLib.getMonthRange(periodNew);

            // Check if the next period already exists
            const existingPeriod = await model.fat_accounting_periods.findOne({
                where: {
                    code_company: worksite,
                    period: periodNew
                },
                transaction
            });

            // Only create if it doesn't exist
            if (!existingPeriod) {
                return await model.fat_accounting_periods.create(
                    {
                        status: 0,
                        code_company: worksite,
                        period: periodNew,
                        start_date: rangerMonth["start"],
                        finish_date: rangerMonth["end"],
                        type: 1
                    },
                    { transaction }
                );
            }

            return existingPeriod;
        }
        function sendSuccessResponse(message, data = null) {
            const response = {
                access: "success",
                message: message
            };
            if (data) response.data = data;
            res.status(200).json(response);
        }
        function sendFailedResponse(message) {
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
        function logAction(status, action = 'Approval') {
            logger.info(`Update Accounting Period Close`, {
                "1.username": username,
                "2.module": "updateAccountingPerodsClose",
                "3.status": status,
                "4.action": req.body
            });
        }
    } catch (error) {
        await transaction.rollback();
        console.error('Full error details:', error);
        if (error.name === 'SequelizeValidationError') {
            console.error('Validation errors:', error.errors);
        }
        res.status(404).json({
            message: error.message || error,
            details: error.errors || null
        });
    }
};
controller.updateAccountingPerodsOpen = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const {
            language_POST: language,
            username_POST: username,
            worksite_POST: worksite,
            company_POST: code_company,
            period_POST: period,
        } = req.body;

        const updateBalanceMonthlyStatusData = await updateBalanceMonthlyStatus();
        if (!updateBalanceMonthlyStatusData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const deleteAccountingPeriodsData = await deleteAccountingPeriods();
        if (!deleteAccountingPeriodsData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.closePeriodMonthly.replace("{{period}}", period));
        logAction('success');

        async function updateBalanceMonthlyStatus() {
            return await model.fat_balance_monthly.update(
                {
                    status: 0
                },
                {
                    where: {
                        code_company,
                        worksite,
                        period_date: period
                    },
                    transaction
                });
        }
        async function deleteAccountingPeriods() {
            await model.fat_accounting_periods.update(
                {
                    status: 0
                },
                {
                    where: {
                        [Op.and]: [
                            { period: period },
                            { code_company: worksite },
                        ]
                    },
                    transaction
                });

            const [y, m] = period.split('-').map(Number);
            const d = new Date(y, m - 1);
            d.setMonth(d.getMonth() + 1);
            const periodNew = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            return await model.fat_accounting_periods.destroy(
                {
                    where: {
                        [Op.and]: [
                            { period: periodNew },
                            { code_company: worksite },
                        ]
                    },
                    transaction
                }
            );


        }
        function sendSuccessResponse(message, data = null) {
            const response = {
                access: "success",
                message: message
            };
            if (data) response.data = data;
            res.status(200).json(response);
        }
        function sendFailedResponse(message) {
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
        function logAction(status, action = 'Approval') {
            logger.info(`Update Accounting Period Close`, {
                "1.username": username,
                "2.module": "updateAccountingPerodsClose",
                "3.status": status,
                "4.action": req.body
            });
        }
    } catch (error) {
        await transaction.rollback();
        console.error('Full error details:', error);
        if (error.name === 'SequelizeValidationError') {
            console.error('Validation errors:', error.errors);
        }
        res.status(404).json({
            message: error.message || error,
            details: error.errors || null
        });
    }
};
module.exports = controller;