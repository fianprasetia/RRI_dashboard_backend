const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectPaymentVoucher = async function (req, res) {
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

        const selectPaymentVoucherData = await selectPaymentVoucher()
        if (selectPaymentVoucherData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        await sendSuccessResponse(messages[language]?.successfulData, selectPaymentVoucherData);

        async function selectPaymentVoucher() {
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
                                [Sequelize.Op.not]: 3
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
                                [Sequelize.Op.not]: 3
                            },
                        }
                    ]
                }
            }
            return await model.fat_payment_voucher.findAll({
                include: [
                    {
                        model: model.fat_payment_voucher_detail,
                        as: "details"
                    },
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
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
                where: whereTemp,
                order: [
                    ['code_payment_voucher', 'ASC'],
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
controller.selectPaymentVoucherByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            code_payment_voucher_POST: codePaymentVoucher,
        } = requestData;

        const selectPaymentVoucherByCodeData = await selectPaymentVoucherByCode()
        if (selectPaymentVoucherByCodeData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectPaymentVoucherByCodeData);
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

        async function selectPaymentVoucherByCode() {
            return await model.fat_payment_voucher.findAll({
                include: [
                    {
                        model: model.fat_payment_voucher_detail,
                        include: [
                            {
                                model: model.fat_coa,
                                include: [
                                    {
                                        model: model.fat_coa_translations,
                                        where: {
                                            language_code: language
                                        },
                                    }
                                ]
                            },
                            {
                                model: model.hrd_department,
                                include: [
                                    {
                                        model: model.hrd_department_translations,
                                        where: {
                                            language_code: language
                                        },
                                    }
                                ],
                                as: "department"
                            },
                        ],
                        as: "details"
                    },
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
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
                        attributes: ["code_partners", "name", "contact_person"],
                        include: [
                            {
                                model: model.log_partners_type
                            }
                        ]
                    },
                ],
                where: {
                    code_payment_voucher: codePaymentVoucher
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
controller.selectPaymentVoucherByCashBank = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            worksite_POST: worksite,
            pph_POST: pph
        } = requestData;

        const selectPaymentVoucherData = await selectPaymentVoucher()
        if (selectPaymentVoucherData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectPaymentVoucherData);
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

        async function selectPaymentVoucher() {
            // const has118 = await model.fat_payment_voucher.findAll({
            //     where: {
            //         code_coa: { [Op.like]: '118%' },
            //         status: '1',
            //     },
            // });
            var dataPaymentVoucherType = pph === "2" ?
                {
                    [Op.and]: [
                        {
                            worksite
                        },
                        { status: 1 },
                        {
                            [Op.or]: [
                                { code_payment_voucher_type: "DP" },
                                { code_payment_voucher_type: "OT" },
                                { code_payment_voucher_type: "DW" },
                            ],
                        },
                    ]
                } : pph === "0" ?
                    {
                        [Op.and]: [
                            {
                                worksite
                            },
                            { status: 1 },
                            {
                                code_payment_voucher_type: {
                                    [Op.notIn]: ['DP'],
                                    [Op.notIn]: ['DW'],
                                },
                            },
                        ]
                    } :
                    {
                        [Op.and]: [
                            {
                                worksite
                            },
                            { status: 1 }
                        ]
                    }
            //hanya PPH
            var dataPPH = pph === "1" ?
                {
                    [Op.and]: [
                        {
                            code_coa: {
                                [Sequelize.Op.like]: '21201%'
                            }
                        },
                        {
                            status: 1
                        }
                    ]
                } : pph === "0" ?
                    //payment full
                    {
                        [Op.and]: [
                            {
                                code_coa: {
                                    [Op.and]: [
                                        { [Op.notLike]: '21201%' },
                                        { [Op.notLike]: '118%' },
                                    ],
                                },
                            },
                            { status: '1' },
                        ],
                    } : pph === "2" ?
                        //down payment
                        {
                            [Op.and]: [
                                {
                                    [Op.or]: [
                                        { code_coa: '11601001' },
                                        {
                                            code_coa: {
                                                [Sequelize.Op.like]: '118%'
                                            },
                                        },
                                    ],
                                },
                                { status: '1' },
                            ],
                        } : {};
            return await model.fat_payment_voucher.findAll({
                include: [
                    {
                        model: model.fat_payment_voucher_detail,
                        where: dataPPH,
                        as: "details"
                    },
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
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
                where: dataPaymentVoucherType
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
controller.insertPaymentVoucher = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            employeeID_POST: employee,
            username_POST: username,
            company_code_POST: companyCode,
            worksite_code_POST: worksite,
            partners_POST: partner,
            type_voucher_POST: typeVoucher,
            no_transaction_POST: noTransaction,
            note_POST: note,
            currency_POST: currency,
            no_invoice_POST: noInvoice,
            receive_date_POST: receiveDate,
            currency_rate_POST: currencyRate,
            due_date_POST: dueDate,
            tax_invoice_number_POST: taxInvoiceNumber,
            tax_invoice_date_POST: taxInvoiceDate,
            invoice_amount_POST: invoiceAmount,
            detail: details
        } = requestData;

        const yearAndMonth = receiveDate.split("-").slice(0, 2).join("-");
        const formattedDate = receiveDate.split("-").slice(0, 2).join("");

        const newCode = await generatePaymentVoucherCode();

        const insertPaymentVoucherData = await insertPaymentVoucher(newCode);
        if (!insertPaymentVoucherData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        const insertPaymentVoucherDetailData = await insertPaymentVoucherDetail(newCode, details);

        if (!insertPaymentVoucherDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');

        async function generatePaymentVoucherCode() {
            const existingIssues = await model.fat_payment_voucher.findAll({
                where: {
                    [Op.and]: [
                        Sequelize.where(
                            Sequelize.fn('to_char', Sequelize.col('date_create'), 'YYYY-MM'),
                            yearAndMonth
                        )
                    ]
                },
                transaction
            });
            let sequenceNumber;
            if (existingIssues.length > 0) {
                const maxCode = Math.max(
                    ...existingIssues.map(issue => parseInt(issue.code_payment_voucher, 10))
                );
                const endDigits = String(maxCode).slice(-3);
                sequenceNumber = (parseInt(endDigits) + 1).toString().padStart(3, "0");
            } else {
                sequenceNumber = "001";
            }
            return `${formattedDate}${sequenceNumber}`;
        }
        async function insertPaymentVoucher(newCode) {
            return await model.fat_payment_voucher.create({
                code_payment_voucher: newCode,
                no_invoice: noInvoice,
                code_payment_voucher_type: typeVoucher,
                code_company: companyCode,
                worksite: worksite,
                date_create: receiveDate,
                code_partners: partner,
                currency: currency,
                exchange_rate: currencyRate,
                due_date: dueDate,
                tax_invoice_number: taxInvoiceNumber,
                tax_invoice_date: taxInvoiceDate,
                invoice_amount: invoiceAmount,
                create_by: employee,
                update_by: employee,
                no_transaction: noTransaction,
                note: note,
                status: 0
            }, { transaction });
        }
        async function insertPaymentVoucherDetail(newCode, items, warehousePrices) {
            const detailRecords = items.map((item, index) => {
                return {
                    code_payment_voucher: newCode,
                    asset_code: item.code_asset_POST,
                    department_code: item.department_POST,
                    code_coa: item.code_coa_POST,
                    amount: item.amount_POST,
                    status: 0
                };
            });
            return await model.fat_payment_voucher_detail.bulkCreate(
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
            logger.info(`Insert Payment Voucher`, {
                "1.username": username,
                "2.module": "insertPaymentVoucher",
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
controller.updatePaymentVoucher = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body[0];
        const {
            code_payment_voucher_POST: code,
            language_POST: language,
            employeeID_POST: employee,
            username_POST: username,
            company_code_POST: companyCode,
            worksite_code_POST: worksite,
            partners_POST: partner,
            type_voucher_POST: typeVoucher,
            no_transaction_POST: noTransaction,
            note_POST: note,
            currency_POST: currency,
            no_invoice_POST: noInvoice,
            receive_date_POST: receiveDate,
            currency_rate_POST: currencyRate,
            due_date_POST: dueDate,
            tax_invoice_number_POST: taxInvoiceNumber,
            tax_invoice_date_POST: taxInvoiceDate,
            invoice_amount_POST: invoiceAmount,
            detail: details
        } = requestData;

        const updatePaymentVoucherData = await updatePaymentVoucher()
        if (!updatePaymentVoucherData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        const deletePaymentVoucherDetailData = await deletePaymentVoucherDetail()
        if (!deletePaymentVoucherDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const insertPaymentVoucherDetailData = await insertPaymentVoucherDetail()
        if (!insertPaymentVoucherDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData, insertPaymentVoucherDetailData);
        logAction('success');

        async function updatePaymentVoucher() {
            return await model.fat_payment_voucher.update(
                {
                    no_invoice: noInvoice,
                    code_payment_voucher_type: typeVoucher,
                    code_company: companyCode,
                    worksite: worksite,
                    date_create: receiveDate,
                    code_partners: partner,
                    currency: currency,
                    exchange_rate: currencyRate,
                    due_date: dueDate,
                    tax_invoice_number: taxInvoiceNumber,
                    tax_invoice_date: taxInvoiceDate,
                    invoice_amount: invoiceAmount,
                    create_by: employee,
                    update_by: employee,
                    no_transaction: noTransaction,
                    note: note,
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
        async function deletePaymentVoucherDetail() {
            return await model.fat_payment_voucher_detail.destroy({
                where: {
                    code_payment_voucher: code,
                },
                transaction: transaction
            });
        }
        async function insertPaymentVoucherDetail() {
            const rowsToInsert = details.map((item, i) => ({
                code_payment_voucher: code,
                asset_code: item.code_asset_POST,
                department_code: item.department_POST,
                code_coa: item.code_coa_POST,
                amount: item.amount_POST,
                status: 0
            }));
            return await model.fat_payment_voucher_detail.bulkCreate(rowsToInsert, { transaction });
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
controller.deletePaymentVoucher = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            code_payment_voucher_POST: code,
            language_POST: language,
            employeeID_POST: employee,
            username_POST: username,
        } = requestData;

        const updatePaymentVoucherData = await updatePaymentVoucher()
        if (!updatePaymentVoucherData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        const deletePaymentVoucherDetailData = await updatePaymentVoucherDetail()
        if (!deletePaymentVoucherDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.deleteData, deletePaymentVoucherDetailData);
        logAction('success');

        async function updatePaymentVoucher() {
            return await model.fat_payment_voucher.update(
                {
                    status: 3,
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
                    status: 3,
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
            logger.info(`Delete Payment Voucher`, {
                "1.username": username,
                "2.module": "deletePaymentVoucher",
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
controller.postingPaymentVoucher = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            code_payment_voucher_POST: code,
            language_POST: language,
            username_POST: username,
            employeeID_POST: employee,
        } = requestData;

        const PaymentVoucherData = await selectPaymentVoucherByCode()
        if (PaymentVoucherData.length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        await processJournalEntries(PaymentVoucherData)
        await updateBalanceMonthly(PaymentVoucherData)
        await updatePaymentVoucher()
        await updatePaymentVoucherDetail()

        await transaction.commit();
        sendSuccessResponse(messages[language]?.postingData);
        logAction('success');

        async function selectPaymentVoucherByCode() {
            return await model.fat_payment_voucher.findAll({
                include: [
                    {
                        model: model.fat_payment_voucher_detail,
                        include: [
                            {
                                model: model.fat_coa,
                                attributes: ["code_coa"],
                                include: {
                                    model: model.fat_coa_translations,
                                    attributes: ["language_code", "translation"],
                                    where: {
                                        language_code: language
                                    },
                                },
                            }
                        ],
                        as: "details"
                    },
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
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
                    code_payment_voucher: code
                },
            });
        }
        async function processJournalEntries(PaymentVoucherData) {
            const journalCode = await generateJournalCode(PaymentVoucherData);
            await handleAccountPPH(journalCode, PaymentVoucherData)
        }
        async function generateJournalCode(PaymentVoucherData) {
            const { worksite } = PaymentVoucherData[0]
            const datePV = PaymentVoucherData[0].date_create;
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
        async function handleAccountPPH(journalCode, PaymentVoucherData) {
            const {
                details
            } = PaymentVoucherData[0];
            const DetailsNotPPH = details.filter(item => !item.code_coa.startsWith("21201"));
            const filterPPH = details.filter(item => item.code_coa.startsWith("21201"));
            const resultCredit = await createCreditJournalEntry(journalCode, PaymentVoucherData, DetailsNotPPH, filterPPH);
            const resultDebit = await createDebitJournalEntry(journalCode, PaymentVoucherData, DetailsNotPPH, filterPPH, resultCredit);
        }
        async function createCreditJournalEntry(journalCode, PaymentVoucherData, DetailsNotPPH, filterPPH) {
            const {
                code_company,
                worksite,
                code_payment_voucher,
                date_create,
                exchange_rate,
                code_payment_voucher_type,
                log_partner: {
                    log_partners_type: { code_coa },
                    code_partners
                },
            } = PaymentVoucherData[0];
            if (DetailsNotPPH.length > 0) {
                const totalNotPPH = DetailsNotPPH.reduce((sum, item) => sum + (item.amount * exchange_rate), 0);
                var dataCredit = await model.fat_journal.create({
                    code_journal: journalCode,
                    code_company,
                    worksite,
                    code_coa,
                    sequence_number: 1,
                    description: `AP Form ${code_payment_voucher}`,
                    dk_code: "C",
                    amount: totalNotPPH,
                    reference_code: code_payment_voucher,
                    code_partners,
                    code_item: 0,
                    date: date_create
                }, { transaction });
            }
            // Journal entry untuk PPH (jika ada)
            if (filterPPH.length > 0) {
                const totalPPH = filterPPH.reduce((sum, item) => sum + (item.amount * exchange_rate), 0);
                var dataPPH = await model.fat_journal.create({
                    code_journal: journalCode,
                    code_company,
                    worksite,
                    code_coa: filterPPH[0].code_coa, // Mengambil code_coa dari PPH pertama
                    sequence_number: 2, // Sequence number berbeda
                    description: `PPH for AP Form ${code_payment_voucher}`,
                    dk_code: "C",
                    amount: totalPPH,
                    reference_code: code_payment_voucher,
                    code_partners,
                    code_item: 0,
                    date: date_create
                }, { transaction });
            }
            // if (code_payment_voucher_type == "OT") {
            //     const totalPPH = filterPPH.reduce((sum, item) => sum + (item.amount * exchange_rate), 0);
            //     var dataPPH = await model.fat_journal.create({
            //         code_journal: journalCode,
            //         code_company,
            //         worksite,
            //         code_coa: filterPPH[0].code_coa, // Mengambil code_coa dari PPH pertama
            //         sequence_number: 2, // Sequence number berbeda
            //         description: `PPH for AP Form ${code_payment_voucher}`,
            //         dk_code: "C",
            //         amount: totalPPH,
            //         reference_code: code_payment_voucher,
            //         code_partners,
            //         code_item: 0,
            //         date: date_create
            //     }, { transaction });
            // }
            const result = dataPPH ? [dataCredit, dataPPH] : [dataCredit];
            return result;
        }
        async function createDebitJournalEntry(journalCode, PaymentVoucherData, DetailsNotPPH, filterPPH, resultCredit) {
            // const sequenceOffset = resultCredit ? resultCredit[0].sequence_number + 2 : 1;

            const {
                code_company,
                worksite,
                code_payment_voucher,
                date_create,
                exchange_rate,
                log_partner: {
                    log_partners_type: { code_coa },
                    code_partners
                },
            } = PaymentVoucherData[0];
            const lastCreditSequence = resultCredit.length > 0 ? resultCredit[resultCredit.length - 1].sequence_number : 0;
            let sequenceOffset = lastCreditSequence + 1;

            const journalEntries = [];
            const debitEntries = DetailsNotPPH.map((detail, index) => ({
                code_journal: journalCode,
                code_company,
                worksite,
                code_coa: detail.fat_coa.code_coa,
                sequence_number: sequenceOffset + index,
                description: `AP Form ${code_payment_voucher}`,
                dk_code: "D",
                amount: detail.amount * exchange_rate,
                reference_code: code_payment_voucher,
                code_partners,
                code_item: 0,
                date: date_create
            }));

            const dataDedit = await model.fat_journal.bulkCreate(debitEntries, { transaction });
            if (debitEntries.length > 0) {
                sequenceOffset = debitEntries[debitEntries.length - 1].sequence_number + 1;
            }
            if (filterPPH.length > 0) {
                const totalPPH = filterPPH.reduce((sum, item) => sum + (item.amount * exchange_rate), 0);
                var dataPPH = await model.fat_journal.create({
                    code_journal: journalCode,
                    code_company,
                    worksite,
                    code_coa, // Mengambil code_coa dari PPH pertama
                    sequence_number: sequenceOffset, // Sequence number berbeda
                    description: `PPH for AP for ${code_coa}`,
                    dk_code: "D",
                    amount: totalPPH,
                    reference_code: code_payment_voucher,
                    code_partners,
                    code_item: 0,
                    date: date_create
                }, { transaction });
            }
            const result = dataPPH ? [dataDedit, dataPPH] : [dataDedit];
            return result
        }
        async function updateBalanceMonthly(PaymentVoucherData) {

            const journalEntries = await model.fat_journal.findAll({
                where: { reference_code: PaymentVoucherData[0].code_payment_voucher.toString() },
                transaction
            });
            const { code_company } = PaymentVoucherData[0];
            const { worksite } = PaymentVoucherData[0];
            const date = new Date(PaymentVoucherData[0].date_create);
            const periodDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const exchangeRate = PaymentVoucherData[0].exchange_rate;
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
                const updateData = {
                    [entry.dk_code === "D" ? "debit" : "credit"]: Sequelize.literal(
                        `${entry.dk_code === "D" ? "debit" : "credit"} + ${amount}`
                    )
                };
                if (existingBalance) {
                    var updateResult = await model.fat_balance_monthly.update(updateData, {
                        where: {
                            code_company,
                            worksite,
                            code_coa: entry.code_coa,
                            period_date: periodDate
                        },
                        transaction
                    });
                } else {
                    var createdRecord = await model.fat_balance_monthly.create({
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: periodDate,
                        opening_balance: 0,
                        debit: entry.dk_code === "D" ? amount : 0,
                        credit: entry.dk_code === "C" ? amount : 0,
                        status: 0
                    }, { transaction });
                }
            }
        }
        async function updatePaymentVoucher() {
            return await model.fat_payment_voucher.update(
                {
                    status: 1,
                    update_by: employee
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
                    status: 1,
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
            logger.info(`Posting Payment Voucher`, {
                "1.username": username,
                "2.module": "postingPaymentVoucher",
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