const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectCashBank = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            start_date_POST: startDate,
            end_date_POST: endDate,
            employee_code_POST: employeeCode,
            company_code_POST: companyCode,
            parent_code_POST: parentCode,
            company_type_POST: companyType,
        } = requestData;

        const selectCashBankData = await selectCashBank()
        if (selectCashBankData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        await sendSuccessResponse(messages[language]?.successfulData, selectCashBankData);

        async function selectCashBank() {
            if (companyType == 'Head') {
                whereTemp = {
                    [Op.and]: [
                        { code_company: parentCode },
                        {
                            date_create: {
                                [Op.between]: [startDate, endDate]
                            },
                        },
                        {
                            status: {
                                [Sequelize.Op.not]: 2
                            },
                        }
                    ]
                }
            } else {
                whereTemp = {
                    [Op.and]: [
                        { worksite: companyCode },
                        {
                            date_create: {
                                [Op.between]: [startDate, endDate]
                            },
                        },
                        {
                            status: {
                                [Sequelize.Op.not]: 2
                            },
                        }
                    ]
                }
            }
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
                where: whereTemp,
                order: [
                    ['code_cash_bank', 'ASC'],
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
controller.insertCashBank = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body[0];
        const {

            language_POST: language,
            username_POST: username,
            employeeID_POST: employeeID,
            company_code_POST: company,
            worksite_POST: worksite,
            code_coa_POST: codecoa,
            source_of_funds_POST: sourceOfFunds,
            create_date_POST: createDate,
            type_POST: type,
            paid_to_POST: paidTo,
            currency_POST: currency,
            currency_rate_POST: currencyRate,
            payment_method_POST: payment,
            invoice_amount_POST: invoiceAmount,
            note_POST: note,
            detail: details
        } = requestData;

        const yearAndMonth = createDate.split("-").slice(0, 2).join("-");
        const formattedDate = createDate.split("-").slice(0, 2).join("");

        var newCode = await generateCashBankCode();

        const insertCashBankData = await insertCashBank(newCode);
        if (!insertCashBankData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        const insertCashBankDetailData = await insertCashBankDetail(newCode, details);
        if (!insertCashBankDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');

        async function generateCashBankCode() {
            const existingIssues = await model.fat_cash_bank.findAll({
                where: {
                    [Op.and]: [
                        Sequelize.where(
                            Sequelize.fn('to_char', Sequelize.col('date_create'), 'YYYY-MM'),
                            yearAndMonth
                        ),
                        {
                            code_company: company
                        },
                        {
                            type_transactions: type
                        }
                    ]
                },
                transaction
            });
            let sequenceNumber;
            if (existingIssues.length > 0) {
                const maxCode = Math.max(
                    ...existingIssues.map(issue => parseInt(issue.code_cash_bank, 10))
                );
                const endDigits = String(maxCode).slice(-3);
                sequenceNumber = (parseInt(endDigits) + 1).toString().padStart(3, "0");
            } else {
                sequenceNumber = "001";
            }
            return `${sequenceNumber}/${type.toUpperCase()}/${company}/${worksite}/${formattedDate}`;
        }
        async function insertCashBank(newCode) {
            return await model.fat_cash_bank.create({
                code_cash_bank: newCode,
                code_company: company,
                worksite: worksite,
                code_coa: codecoa,
                bank_account_number: sourceOfFunds,
                date_create: createDate,
                type_transactions: type,
                paid_to: paidTo,
                currency: currency,
                exchange_rate: currencyRate,
                payment_method: payment,
                amount: invoiceAmount,
                note: note,
                status: 0,
                create_by: employeeID,
                update_by: employeeID,
            }, { transaction });
        }
        async function insertCashBankDetail(newCode, items) {
            const detailRecords = items.map((item, index) => {
                return {
                    code_cash_bank: newCode,
                    code_coa: item.code_coa_POST,
                    code_transactions: item.no_transaction_POST,
                    code_partners: item.code_partner_POST,
                    employee_id: item.code_employee_POST,
                    amount: item.invoice_amount_POST,
                    note: item.note_POST,
                    status: 0
                };
            });
            return await model.fat_cash_bank_detail.bulkCreate(
                detailRecords,
                { transaction }
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
            logger.info(`Insert Cash Bank`, {
                "1.username": username,
                "2.module": "insertCashBank",
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
controller.selectCashBankByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            code_cash_bank_POST: code,
        } = requestData;

        const selectCashBankData = await selectCashBank()
        if (selectCashBankData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectCashBankData);
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

        async function selectCashBank() {
            return await model.fat_cash_bank.findAll({
                include: [
                    {
                        model: model.fat_cash_bank_detail,
                        as: "details",
                        include: [
                            {
                                model: model.fat_coa,
                                include: {
                                    model: model.fat_coa_translations,
                                    attributes: ["language_code", "translation"],
                                    where: {
                                        language_code: language
                                    },
                                },
                            },
                            {
                                model: model.hrd_employee,
                                attributes: ["employee_id", "fullname"],
                            },
                            {
                                model: model.log_partners,
                                attributes: ["name"],
                            }
                        ]
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
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
}
controller.updateCashBank = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body[0];
        const {
            code_cash_bank_POST: code,
            language_POST: language,
            username_POST: username,
            employeeID_POST: employeeID,
            company_code_POST: company,
            worksite_POST: worksite,
            code_coa_POST: codecoa,
            source_of_funds_POST: sourceOfFunds,
            create_date_POST: createDate,
            type_POST: type,
            paid_to_POST: paidTo,
            currency_POST: currency,
            currency_rate_POST: currencyRate,
            payment_method_POST: payment,
            invoice_amount_POST: invoiceAmount,
            note_POST: note,
            detail: details
        } = requestData;

        const updateCashBankData = await updateCashBank()
        if (!updateCashBankData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        const deleteCashBankDetailData = await deleteCashBankDetail()
        if (!deleteCashBankDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const insertCashBankDetailData = await insertCashBankDetail(details)
        if (!insertCashBankDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData, insertCashBankDetailData);
        logAction('success');

        async function updateCashBank() {
            return await model.fat_cash_bank.update(
                {
                    code_company: company,
                    worksite: worksite,
                    code_coa: codecoa,
                    bank_account_number: sourceOfFunds,
                    date_create: createDate,
                    type_transactions: type,
                    paid_to: paidTo,
                    currency: currency,
                    exchange_rate: currencyRate,
                    payment_method: payment,
                    amount: invoiceAmount,
                    note: note,
                    status: 0,
                    update_by: employeeID,
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
        async function deleteCashBankDetail() {
            return await model.fat_cash_bank_detail.destroy({
                where: {
                    code_cash_bank: code,
                },
                transaction: transaction
            });
        }
        async function insertCashBankDetail(items) {
            const detailRecords = items.map((item, index) => {
                return {
                    code_cash_bank: code,
                    code_coa: item.code_coa_POST,
                    code_transactions: item.no_transaction_POST,
                    code_partners: item.code_partner_POST,
                    employee_id: item.code_employee_POST,
                    amount: item.invoice_amount_POST,
                    note: item.note_POST,
                    status: 0
                };
            });
            return await model.fat_cash_bank_detail.bulkCreate(
                detailRecords,
                { transaction }
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
            logger.info(`Update Payment Voucher`, {
                "1.username": username,
                "2.module": "updatePaymentVoucher",
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
controller.postingCashBankOut = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            code_cash_bank_POST: code,
            username_POST: username,
            employeeID_POST: employeeID,
        } = requestData;

        const selectCashBankData = await selectCashBank()
        if (selectCashBankData.length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const newCode = await generateJournalCode(selectCashBankData);
        if (!newCode) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect + " newCode");
        }
        const resultDebit = await createDebitJournalEntry(newCode, selectCashBankData);
        if (!resultDebit) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect + " resultDebit");
        }
        const resultCredit = await createCreditJournalEntry(newCode, selectCashBankData, resultDebit);
        if (!resultCredit) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect + " resultCredit");
        }
        const updateBalanceMonthlyData = await updateBalanceMonthly(selectCashBankData)
        if (!updateBalanceMonthlyData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect + " updateBalanceMonthlyData");
        }
        const updateCashBankData = await updateCashBank()
        if (!updateCashBankData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect + " updateCashBankData");
        }
        const updateCashBankDetailData = await updateCashBankDetail()
        if (!updateCashBankDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect + " updateCashBankDetailData");
        }
        const handleAccountPPHData = await handleAccountPPH(selectCashBankData)
        if (handleAccountPPHData.length == 0) {
            await updatePaymentVoucherDetail(selectCashBankData)
            await updatePaymentVoucher(selectCashBankData)
            await updatePurchaseOrder(selectCashBankData)
        } else {
            const updatePaymentVoucherDetailData = await updatePaymentVoucherDetailPPH(selectCashBankData)
            if (updatePaymentVoucherDetailData.length == 0) {
                await updatePaymentVoucher(selectCashBankData)
                await updatePurchaseOrder(selectCashBankData)
            }
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.postingData);
        logAction('success');

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
        async function generateJournalCode(selectCashBankData) {
            const { worksite } = selectCashBankData[0]
            const datePV = selectCashBankData[0].date_create;
            const date = new Date(datePV);
            const yearAndMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const formattedDate = yearAndMonth.split("-").slice(0, 2).join("");
            const existingJournals = await model.fat_journal.findAll({
                where: {
                    [Op.and]: [
                        { worksite },
                        Sequelize.where(
                            Sequelize.fn('to_char', Sequelize.col('date'), 'YYYY-MM'),
                            yearAndMonth
                        )
                    ]
                },
                transaction
            });

            let sequenceNumber;
            if (existingJournals.length > 0) {
                const maxCode = Math.max(...existingJournals.map(j =>
                    parseInt(j.code_journal.split("/")[0]))
                );
                sequenceNumber = (maxCode + 1).toString().padStart(3, "0");
            } else {
                sequenceNumber = "001";
            }
            return `${sequenceNumber}/GL/${worksite}/${formattedDate}`;
        }
        async function createDebitJournalEntry(newCode, selectCashBankData) {
            const {
                code_cash_bank,
                code_company,
                worksite,
                date_create,
                exchange_rate,
                details // langsung destructure array details
            } = selectCashBankData[0];

            // Buat sequence number increment mulai dari 1
            const creditEntries = details.map((detail, index) => ({
                code_journal: newCode,
                code_company,
                worksite,
                code_coa: detail.code_coa,
                sequence_number: index + 1, // sequence dimulai dari 1, 2, 3, dst
                description: detail.note,
                dk_code: "D",
                amount: detail.amount * exchange_rate,
                reference_code: code_cash_bank,
                code_partners: detail.code_partners, // pastikan ambil dari detail
                code_item: 0,
                date: date_create
            }));

            return await model.fat_journal.bulkCreate(creditEntries, { transaction });
        }
        async function createCreditJournalEntry(newCode, selectCashBankData, resultDedit) {
            const {
                code_cash_bank,
                code_company,
                worksite,
                date_create,
                exchange_rate,
                code_coa,
                note,
            } = selectCashBankData[0];
            const totalAmount = resultDedit.reduce((sum, item) => sum + (item.amount * exchange_rate), 0);
            const lastCreditSequence = resultDedit.length > 0 ? resultDedit[resultDedit.length - 1].sequence_number : 0;
            let sequenceOffset = lastCreditSequence + 1;
            const journalEntries = [];
            return await model.fat_journal.create({
                code_journal: newCode,
                code_company,
                worksite,
                code_coa,
                sequence_number: sequenceOffset,
                description: note,
                dk_code: "C",
                amount: totalAmount,
                reference_code: code_cash_bank,
                code_partners: "",
                code_item: 0,
                date: date_create
            }, { transaction });
        }
        async function updateBalanceMonthly(selectCashBankData) {
            const journalEntries = await model.fat_journal.findAll({
                where: { reference_code: selectCashBankData[0].code_cash_bank.toString() },
                transaction
            });

            const { code_company, worksite } = selectCashBankData[0];
            const date = new Date(selectCashBankData[0].date_create);
            const periodDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const exchangeRate = selectCashBankData[0].exchange_rate;

            const results = [];

            for (const entry of journalEntries) {
                const existingBalance = await model.fat_balance_monthly.findOne({
                    where: {
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: periodDate,
                    },
                    transaction
                });

                const amount = entry.amount * exchangeRate;

                if (existingBalance) {
                    // Update existing record
                    const updateData = {
                        [entry.dk_code === "D" ? "debit" : "credit"]: Sequelize.literal(
                            `${entry.dk_code === "D" ? "debit" : "credit"} + ${amount}`
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
                } else {
                    // Create new record
                    const createdRecord = await model.fat_balance_monthly.create({
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: periodDate,
                        opening_balance: 0,
                        debit: entry.dk_code === "D" ? amount : 0,
                        credit: entry.dk_code === "C" ? amount : 0,
                        status: 0
                    }, { transaction });

                    results.push(createdRecord);
                }
            }

            return results;
        }
        async function updateCashBank() {
            return await model.fat_cash_bank.update(
                {
                    status: 1,
                    update_by: employeeID
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
                    status: 1,
                    update_by: employeeID
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
        async function handleAccountPPH(selectCashBankData) {
            const { details } = selectCashBankData[0];
            filterPPH = details.filter(item => item.code_coa.startsWith("21201"));
            return filterPPH
        }
        async function updatePaymentVoucherDetailPPH(selectCashBankData) {
            const { details } = selectCashBankData[0];
            for (const entry of details) {
                await model.fat_payment_voucher_detail.update(
                    {
                        status: 2,
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
                return await model.fat_payment_voucher_detail.findAll({
                    where: {
                        [Op.and]: [
                            {
                                code_payment_voucher: entry.code_transactions,
                            },
                            {
                                status: {
                                    [Op.in]: [0, 1]
                                },
                            }
                        ]

                    },
                })
            }
        }
        async function updatePaymentVoucherDetail(selectCashBankData) {
            const { details } = selectCashBankData[0];
            for (const entry of details) {
                await model.fat_payment_voucher_detail.update(
                    {
                        status: 2,
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
        async function updatePaymentVoucher(selectCashBankData) {
            const { details } = selectCashBankData[0];
            for (const entry of details) {
                await model.fat_payment_voucher.update(
                    {
                        status: 2,
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
        async function updatePurchaseOrder(selectCashBankData) {
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

                selectPurchaseOrderData = await model.log_purchase_order.findAll({
                    where:
                    {
                        code_purchase_order: entry.no_transaction

                    },
                    transaction
                });
                const totalAmountPO = selectPurchaseOrderData[0]["remaining_subtotal"]
                const selisih = totalAmountPO - totalAmount;
                let updateData = ""
                if (selisih <= 0) {
                    updateData = {
                        [Op.and]: [
                            {
                                status: 4,
                            },
                            {
                                remaining_subtotal: selisih
                            }
                        ]
                    }
                } else {
                    updateData = {
                        remaining_subtotal: selisih
                    }
                }
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
            logger.info(`Posting Cash Bank Out`, {
                "1.username": username,
                "2.module": "postingCashBankOut",
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
controller.postingCashBankIn = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            code_cash_bank_POST: code,
            username_POST: username,
            employeeID_POST: employeeID,
        } = requestData;

        const selectCashBankData = await selectCashBank()
        if (selectCashBankData.length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const newCode = await generateJournalCode(selectCashBankData);
        if (!newCode) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect + " newCode");
        }
        const resultCredit = await createCreditJournalEntry(newCode, selectCashBankData);
        if (!resultCredit) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect + " resultCredit");
        }
        const resultDebit = await createDebitJournalEntry(newCode, selectCashBankData, resultCredit);
        if (!resultDebit) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect + " resultDebit");
        }
        const updateBalanceMonthlyData = await updateBalanceMonthly(selectCashBankData)
        if (!updateBalanceMonthlyData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect + " updateBalanceMonthlyData");
        }
        const updateCashBankData = await updateCashBank()
        if (!updateCashBankData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect + " updateCashBankData");
        }
        const updateCashBankDetailData = await updateCashBankDetail()
        if (!updateCashBankDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect + " updateCashBankDetailData");
        }
        const handleAccountPPHData = await handleAccountPPH(selectCashBankData)
        if (handleAccountPPHData.length == 0) {
            await updatePaymentVoucherDetail(selectCashBankData)
            await updatePaymentVoucher(selectCashBankData)
            await updatePurchaseOrder(selectCashBankData)
        } else {
            const updatePaymentVoucherDetailData = await updatePaymentVoucherDetailPPH(selectCashBankData)
            if (updatePaymentVoucherDetailData.length == 0) {
                await updatePaymentVoucher(selectCashBankData)
                await updatePurchaseOrder(selectCashBankData)
            }
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.postingData);
        logAction('success');

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
        async function generateJournalCode(selectCashBankData) {
            const { worksite } = selectCashBankData[0]
            const datePV = selectCashBankData[0].date_create;
            const date = new Date(datePV);
            const yearAndMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const formattedDate = yearAndMonth.split("-").slice(0, 2).join("");
            const existingJournals = await model.fat_journal.findAll({
                where: {
                    [Op.and]: [
                        { worksite },
                        Sequelize.where(
                            Sequelize.fn('to_char', Sequelize.col('date'), 'YYYY-MM'),
                            yearAndMonth
                        )
                    ]
                },
                transaction
            });

            let sequenceNumber;
            if (existingJournals.length > 0) {
                const maxCode = Math.max(...existingJournals.map(j =>
                    parseInt(j.code_journal.split("/")[0]))
                );
                sequenceNumber = (maxCode + 1).toString().padStart(3, "0");
            } else {
                sequenceNumber = "001";
            }
            return `${sequenceNumber}/GL/${worksite}/${formattedDate}`;
        }
        async function createCreditJournalEntry(newCode, selectCashBankData) {
            const {
                code_cash_bank,
                code_company,
                worksite,
                date_create,
                exchange_rate,
                details // langsung destructure array details
            } = selectCashBankData[0];
            // Buat sequence number increment mulai dari 1
            const creditEntries = details.map((detail, index) => ({
                code_journal: newCode,
                code_company,
                worksite,
                code_coa: detail.code_coa,
                sequence_number: index + 1, // sequence dimulai dari 1, 2, 3, dst
                description: detail.note,
                dk_code: "C",
                amount: detail.amount * exchange_rate,
                reference_code: code_cash_bank,
                code_partners: detail.code_partners, // pastikan ambil dari detail
                code_item: 0,
                date: date_create
            }));

            return await model.fat_journal.bulkCreate(creditEntries, { transaction });
        }
        async function createDebitJournalEntry(newCode, selectCashBankData, resultCredit) {
            const {
                code_cash_bank,
                code_company,
                worksite,
                date_create,
                exchange_rate,
                code_coa,
                note,
            } = selectCashBankData[0];
            const totalAmount = resultCredit.reduce((sum, item) => sum + (item.amount * exchange_rate), 0);
            const lastCreditSequence = resultCredit.length > 0 ? resultCredit[resultCredit.length - 1].sequence_number : 0;
            let sequenceOffset = lastCreditSequence + 1;
            const journalEntries = [];
            return await model.fat_journal.create({
                code_journal: newCode,
                code_company,
                worksite,
                code_coa,
                sequence_number: sequenceOffset,
                description: note,
                dk_code: "D",
                amount: totalAmount,
                reference_code: code_cash_bank,
                code_partners: "",
                code_item: 0,
                date: date_create
            }, { transaction });
        }
        async function updateBalanceMonthly(selectCashBankData) {
            const journalEntries = await model.fat_journal.findAll({
                where: { reference_code: selectCashBankData[0].code_cash_bank.toString() },
                transaction
            });

            const { code_company, worksite } = selectCashBankData[0];
            const date = new Date(selectCashBankData[0].date_create);
            const periodDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const exchangeRate = selectCashBankData[0].exchange_rate;

            const results = [];

            for (const entry of journalEntries) {
                const existingBalance = await model.fat_balance_monthly.findOne({
                    where: {
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: periodDate,
                    },
                    transaction
                });

                const amount = entry.amount * exchangeRate;

                if (existingBalance) {
                    // Update existing record
                    const updateData = {
                        [entry.dk_code === "D" ? "debit" : "credit"]: Sequelize.literal(
                            `${entry.dk_code === "D" ? "debit" : "credit"} + ${amount}`
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
                } else {
                    // Create new record
                    const createdRecord = await model.fat_balance_monthly.create({
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: periodDate,
                        opening_balance: 0,
                        debit: entry.dk_code === "D" ? amount : 0,
                        credit: entry.dk_code === "C" ? amount : 0,
                        status: 0
                    }, { transaction });

                    results.push(createdRecord);
                }
            }

            return results;
        }
        async function updateCashBank() {
            return await model.fat_cash_bank.update(
                {
                    status: 1,
                    update_by: employeeID
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
                    status: 1,
                    update_by: employeeID
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
        async function handleAccountPPH(selectCashBankData) {
            const { details } = selectCashBankData[0];
            filterPPH = details.filter(item => item.code_coa.startsWith("21201"));
            return filterPPH
        }
        async function updatePaymentVoucherDetailPPH(selectCashBankData) {
            const { details } = selectCashBankData[0];
            for (const entry of details) {
                await model.fat_payment_voucher_detail.update(
                    {
                        status: 2,
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
                return await model.fat_payment_voucher_detail.findAll({
                    where: {
                        [Op.and]: [
                            {
                                code_payment_voucher: entry.code_transactions,
                            },
                            {
                                status: {
                                    [Op.in]: [0, 1]
                                },
                            }
                        ]

                    },
                })
            }
        }
        async function updatePaymentVoucherDetail(selectCashBankData) {
            const { details } = selectCashBankData[0];
            for (const entry of details) {
                await model.fat_payment_voucher_detail.update(
                    {
                        status: 2,
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
        async function updatePaymentVoucher(selectCashBankData) {
            const { details } = selectCashBankData[0];
            for (const entry of details) {
                await model.fat_payment_voucher.update(
                    {
                        status: 2,
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
        async function updatePurchaseOrder(selectCashBankData) {
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

                selectPurchaseOrderData = await model.log_purchase_order.findAll({
                    where:
                    {
                        code_purchase_order: entry.no_transaction

                    },
                    transaction
                });
                const totalAmountPO = selectPurchaseOrderData[0]["remaining_subtotal"]
                const selisih = totalAmountPO - totalAmount;
                let updateData = ""
                if (selisih <= 0) {
                    updateData = {
                        [Op.and]: [
                            {
                                status: 4,
                            },
                            {
                                remaining_subtotal: selisih
                            }
                        ]
                    }
                } else {
                    updateData = {
                        remaining_subtotal: selisih
                    }
                }
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
            logger.info(`Posting Cash Bank Out`, {
                "1.username": username,
                "2.module": "postingCashBankOut",
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
controller.deleteCashBank = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            code_cash_bank_POST: code,
            language_POST: language,
            employeeID_POST: employee,
            username_POST: username,
        } = requestData;

        const updateCashBankData = await updateCashBank()
        if (!updateCashBankData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        const updateCashBankDetailData = await updateCashBankDetail()
        if (!updateCashBankDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.deleteData, updateCashBankDetailData);
        logAction('success');

        async function updateCashBank() {
            return await model.fat_cash_bank.update(
                {
                    status: 2,
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
                    status: 2,
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
            logger.info(`Delete Cash Bank`, {
                "1.username": username,
                "2.module": "deleteCashBank",
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