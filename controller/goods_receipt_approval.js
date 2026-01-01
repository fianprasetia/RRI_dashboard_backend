const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")
const logger = require('./logger');


controller.selectApprovalGoodsReceipt = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var employee = req.body.employeeID_POST
        let selectApprovalGoodsReceiptData = await model.log_goods_receipt_approval.findAll({
            include:
            {
                model: model.log_goods_receipt,
            },

            where:
            {
                [Op.and]:
                    [
                        { employee_id: employee, },
                        { date: null },
                        { status: 1 }
                    ]
            },
            order: [
                ['createdAt', 'ASC']
            ],
            transaction: transaction
        });
        if (selectApprovalGoodsReceiptData.length > 0) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                data: selectApprovalGoodsReceiptData,
            });
        } else {
            await transaction.rollback();
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
controller.updateApprovalGoodsReceiptWarehouse = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            username_POST: username,
            employeeID_POST: employeeID,
            code_goods_receipt_POST: code,
            note_POST: note,
            date_approve_POST: dateApprove,
            status_POST: status
        } = requestData;

        const updateGoodsReceiptApprovalData = await updateGoodsReceiptApproval();
        if (!updateGoodsReceiptApprovalData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }


        if (status == 2) {
            await handleApproval();
        } else {
            await handleRejection();
        }

        // Helper functions
        async function updateGoodsReceiptApproval() {
            return await model.log_goods_receipt_approval.update(
                {
                    date: dateApprove,
                    note: note,
                    status: status
                },
                {
                    where: {
                        [Op.and]: [
                            { code_goods_receipt: code },
                            { employee_id: employeeID }
                        ]
                    },
                    transaction
                }
            );
        }

        async function handleApproval() {
            const nextApprovers = await getNextApprovers();

            if (nextApprovers.length > 0) {
                await approveNextUser(nextApprovers[0]);
            } else {
                await completeGoodsReceiptApproval();
            }
        }

        async function getNextApprovers() {
            return await model.log_goods_receipt_approval.findAll({
                where: {
                    [Op.and]: [
                        { code_goods_receipt: code },
                        { status: 0 }
                    ]
                },
                order: [['level_approval', 'ASC']],
                transaction
            });
        }

        async function approveNextUser(user) {
            const updateResult = await model.log_goods_receipt_approval.update(
                { status: 1 },
                {
                    where: {
                        [Op.and]: [
                            { employee_id: user.employee_id },
                            { code_goods_receipt: code }
                        ]
                    },
                    transaction
                }
            );

            if (updateResult[0] > 0) {
                await transaction.commit();
                sendSuccessResponse(messages[language]?.updateData, updateResult);
            } else {
                await transaction.rollback();
                return sendFailedResponse(messages[language]?.userAccess);
            }
        }

        async function completeGoodsReceiptApproval() {
            await updateGoodsReceiptStatus();
            const goodsReceiptData = await getGoodsReceiptData();
            await processJournalEntries(goodsReceiptData);
            await updateWarehouseRecords(goodsReceiptData);
            await updatePurchaseOrderDetails(goodsReceiptData);
            await checkPurchaseOrderCompletion(goodsReceiptData);
        }

        async function updateGoodsReceiptStatus() {
            const updateResult = await model.log_goods_receipt.update(
                { status: 2 },
                { where: { code_goods_receipt: code }, transaction }
            );

            if (updateResult[0] === 0) {
                throw new Error("Failed to update goods receipt status");
            }
        }

        async function getGoodsReceiptData() {
            const data = await model.log_goods_receipt.findAll({
                include: [
                    {
                        model: model.log_goods_receipt_detail,
                        include: {
                            model: model.log_item_master,
                            include: model.log_item_category
                        },
                        as: "details",
                        order: [['code_item', 'ASC']]
                    },
                    {
                        model: model.log_purchase_order,
                        include: [{
                            model: model.log_partners,
                            attributes: ["name", "code_partners_type", "code_partners"],
                            include: [model.log_partners_type]
                        }]
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                        as: "employeeWarehouse"
                    }
                ],
                where: { code_goods_receipt: code },
                transaction
            });

            if (!data || data.length === 0) {
                throw new Error("Goods receipt data not found");
            }
            return data;
        }

        async function processJournalEntries(goodsReceiptData) {
            const journalCode = await generateJournalCode(goodsReceiptData);
            await createCreditJournalEntry(journalCode, goodsReceiptData);
            await createDebitJournalEntries(journalCode, goodsReceiptData);
            await updateBalanceMonthly(goodsReceiptData);
        }

        async function generateJournalCode(goodsReceiptData) {
            const { worksite } = goodsReceiptData[0].log_purchase_order;
            const dateGR = goodsReceiptData[0].date;
            const date = new Date(dateGR);
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

        async function createCreditJournalEntry(journalCode, goodsReceiptData) {
            const {
                code_company,
                log_purchase_order: {
                    worksite,
                    log_partner: {
                        log_partners_type: { code_coa },
                        name: partners,
                        code_partners
                    },
                    exchange_rate
                },
                date,
                details
            } = goodsReceiptData[0];

            const totalPrice = details.reduce((sum, item) =>
                sum + (item.discounted_price * item.qty * exchange_rate), 0);

            return await model.fat_journal.create({
                code_journal: journalCode,
                code_company,
                worksite,
                code_coa,
                sequence_number: 1,
                description: `GR Form ${partners}`,
                dk_code: "C",
                amount: totalPrice,
                reference_code: goodsReceiptData[0].code_goods_receipt,
                code_partners,
                code_item: 0,
                date
            }, { transaction });
        }

        async function createDebitJournalEntries(journalCode, goodsReceiptData) {
            const {
                log_purchase_order: { exchange_rate },
                details,
                date,
                code_goods_receipt,
                log_purchase_order: { log_partner: { code_partners } }
            } = goodsReceiptData[0];

            const debitEntries = details.map((detail, index) => ({
                code_journal: journalCode,
                code_company: goodsReceiptData[0].code_company,
                worksite: goodsReceiptData[0].log_purchase_order.worksite,
                code_coa: detail.log_item_master.log_item_category.code_coa,
                sequence_number: index + 2,
                description: `GR Form ${goodsReceiptData[0].log_purchase_order.log_partner.name}`,
                dk_code: "D",
                amount: detail.discounted_price * detail.qty * exchange_rate,
                reference_code: code_goods_receipt,
                code_partners,
                code_item: detail.code_item,
                date
            }));

            return await model.fat_journal.bulkCreate(debitEntries, { transaction });
        }

        async function updateBalanceMonthly(goodsReceiptData) {
            const journalEntries = await model.fat_journal.findAll({
                where: { reference_code: goodsReceiptData[0].code_goods_receipt },
                transaction
            });

            const { code_company } = goodsReceiptData[0];
            const { worksite } = goodsReceiptData[0].log_purchase_order;
            const date = new Date(goodsReceiptData[0].date);
            const periodDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const exchangeRate = goodsReceiptData[0].log_purchase_order.exchange_rate;

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
                    await model.fat_balance_monthly.update(updateData, {
                        where: {
                            code_company,
                            worksite,
                            code_coa: entry.code_coa,
                            period_date: periodDate
                        },
                        transaction
                    });
                } else {
                    await model.fat_balance_monthly.create({
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

        async function updateWarehouseRecords(goodsReceiptData) {
            const { code_company } = goodsReceiptData[0];
            const { warehouse } = goodsReceiptData[0];
            const { details } = goodsReceiptData[0];
            const date = new Date(goodsReceiptData[0].date);
            const periodDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const exchangeRate = goodsReceiptData[0].log_purchase_order.exchange_rate;

            const existingWarehouseData = await model.log_warehouse.findAll({
                where: {
                    [Op.and]: [
                        { code_company },
                        { warehouse },
                        { period: periodDate }
                    ]
                },
                transaction
            });

            const existingItemCodes = existingWarehouseData.map(item => item.code_item);
            const newItems = details.filter(item => !existingItemCodes.includes(item.code_item));
            const updateItems = details.filter(item => existingItemCodes.includes(item.code_item));

            if (updateItems.length > 0) {
                await updateExistingWarehouseItems(updateItems, code_company, warehouse, periodDate, exchangeRate);
            }
            if (newItems.length > 0) {
                await createNewWarehouseItems(newItems, code_company, warehouse, periodDate);
            }
        }

        async function updateExistingWarehouseItems(items, codeCompany, warehouse, periodDate, exchangeRate) {
            for (const item of items) {
                await model.log_warehouse.update(
                    {
                        incoming_qty: Sequelize.literal(`incoming_qty + ${item.qty}`),
                        incoming_price: Sequelize.literal(
                            `((incoming_qty * incoming_price) + ((${item.discounted_price}*${exchangeRate}) * ${item.qty})) / (incoming_qty + ${item.qty})`
                        )
                    },
                    {
                        where: {
                            [Op.and]: [
                                { code_company: codeCompany },
                                { warehouse },
                                { code_item: item.code_item },
                                { period: periodDate }
                            ]
                        },
                        transaction
                    }
                );
            }
        }

        async function createNewWarehouseItems(items, codeCompany, warehouse, periodDate) {
            const warehouseEntries = items.map(item => ({
                code_company: codeCompany,
                warehouse,
                period: periodDate,
                code_item: item.code_item,
                incoming_qty: item.qty,
                incoming_price: item.discounted_price
            }));

            await model.log_warehouse.bulkCreate(warehouseEntries, { transaction });
        }

        async function updatePurchaseOrderDetails(goodsReceiptData) {
            const codePO = goodsReceiptData[0].code_purchase_order;

            for (const item of goodsReceiptData[0].details) {
                await model.log_purchase_order_detail.update(
                    {
                        status: 2,
                        qty_received: Sequelize.literal(`qty_received + ${item.qty}`)
                    },
                    {
                        where: {
                            [Op.and]: [
                                { code_purchase_order: codePO },
                                { code_item: item.code_item }
                            ]
                        },
                        transaction
                    }
                );
            }
        }

        async function checkPurchaseOrderCompletion(goodsReceiptData) {
            const codePO = goodsReceiptData[0].code_purchase_order;
            // Ambil semua detail PO
            const details = await model.log_purchase_order_detail.findAll({
                where: { code_purchase_order: codePO },
                transaction
            });
            // Update status ke 2 jika qty_received == qty
            for (const detail of details) {
                const qty = Number(detail.qty);
                const qtyReceived = Number(detail.qty_received);
                if (qtyReceived === qty) {
                    await model.log_purchase_order_detail.update(
                        { status: 2 },
                        {
                            where: { code_purchase_order_detail: detail.code_purchase_order_detail },
                            transaction
                        }
                    );
                }
            }

            // Cek apakah masih ada item status 1 (belum selesai)
            const pendingItems = await model.log_purchase_order_detail.findAll({
                where: {
                    [Op.and]: [
                        { code_purchase_order: codePO },
                        { status: 1 }
                    ]
                },
                transaction
            });

            if (pendingItems.length === 0) {
                // Semua detail sudah selesai
                await completePurchaseOrder(codePO);
            } else {
                // Masih ada detail yang pending
                await transaction.commit();
                sendSuccessResponse(messages[language]?.postingData);
                logAction('success');
            }
        }

        async function completePurchaseOrder(codePO) {
            const updateResult = await model.log_purchase_order.update(
                { status: 2 },
                { where: { code_purchase_order: codePO }, transaction }
            );

            if (updateResult[0] > 0) {
                await transaction.commit();
                sendSuccessResponse(messages[language]?.postingData, updateResult);
                logAction('success');
            } else {
                await transaction.rollback();
                return sendFailedResponse(messages[language]?.postingCorrect);
            }
        }

        async function handleRejection() {
            await rejectApproval();
            await rejectGoodsReceipt();
            await rejectGoodsReceiptDetails();

            await transaction.commit();
            sendSuccessResponse(messages[language]?.updateData);
            logAction('success', 'Reject');
        }

        async function rejectApproval() {
            const updateResult = await model.log_purchase_request_approval.update(
                { status: 3 },
                {
                    where: {
                        [Op.and]: [
                            { employee_id: employeeID },
                            { code_purchase_request: code }
                        ]
                    },
                    transaction
                }
            );

            if (updateResult[0] === 0) {
                throw new Error("Failed to update approval status");
            }
        }

        async function rejectGoodsReceipt() {
            const updateResult = await model.log_goods_receipt.update(
                { status: 3 },
                { where: { code_goods_receipt: code }, transaction }
            );

            if (updateResult[0] === 0) {
                throw new Error("Failed to update goods receipt status");
            }
        }

        async function rejectGoodsReceiptDetails() {
            const updateResult = await model.log_goods_receipt_detail.update(
                { status: 3 },
                { where: { code_goods_receipt: code }, transaction }
            );

            if (updateResult[0] === 0) {
                throw new Error("Failed to update goods receipt details");
            }
        }

        // Response helper functions
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
            logger.info(`Update ${action} Goods Receipt Warehouse`, {
                "1.username": username,
                "2.module": "updateApprovalGoodsReceiptWarehouse",
                "3.status": status,
                "4.action": req.body
            });
        }

    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error.message || error
        });
        logger.error('Update Approval Goods Receipt Warehouse Error', {
            "1.username": username,
            "2.module": "updateApprovalGoodsReceiptWarehouse",
            "3.status": "error",
            "4.error": error.message || error,
            "5.action": req.body
        });
    }
};
controller.updateApprovalGoodsReceiptAsset = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const {
            language_POST: language,
            employeeID_POST: employeeID,
            code_goods_receipt_POST: code,
            note_POST: note,
            date_approve_POST: dateApprove,
            status_POST: status,
            username_POST: username
        } = req.body;

        // Update approval status
        await updateGoodsReceiptApproval();

        if (status == 2) {
            await handleApproval();
        } else {
            await handleRejection();
        }

        async function updateGoodsReceiptApproval() {
            return await model.log_goods_receipt_approval.update(
                {
                    date: dateApprove,
                    note: note,
                    status: status
                },
                {
                    where: {
                        [Op.and]: [
                            { code_goods_receipt: code },
                            { employee_id: employeeID }
                        ]
                    },
                    transaction: transaction
                }
            );
        }

        async function handleApproval() {
            const nextApprovers = await getNextApprovers();

            if (nextApprovers.length > 0) {
                await approveNextUser(nextApprovers[0]);
            } else {
                await completeGoodsReceiptApproval();
            }
        }

        async function getNextApprovers() {
            return await model.log_goods_receipt_approval.findAll({
                where: {
                    [Op.and]: [
                        { code_goods_receipt: code },
                        { status: 0 }
                    ]
                },
                order: [['level_approval', 'ASC']],
                transaction: transaction
            });
        }

        async function approveNextUser(user) {
            const updateResult = await model.log_goods_receipt_approval.update(
                { status: 1 },
                {
                    where: {
                        [Op.and]: [
                            { employee_id: user.employee_id },
                            { code_goods_receipt: code }
                        ]
                    },
                    transaction: transaction
                }
            );

            if (updateResult[0] > 0) {
                await transaction.commit();
                sendSuccessResponse(messages[language]?.updateData, updateResult);
            } else {
                await transaction.rollback();
                return sendFailedResponse(messages[language]?.userAccess);
            }
        }

        async function completeGoodsReceiptApproval() {
            await updateGoodsReceiptStatus();
            const goodsReceiptData = await getGoodsReceiptData();
            await processJournalEntries(goodsReceiptData);
            await processAssets(goodsReceiptData);
            await updatePurchaseOrderDetails(goodsReceiptData);
            await checkPurchaseOrderCompletion(goodsReceiptData);
        }

        async function updateGoodsReceiptStatus() {
            const updateResult = await model.log_goods_receipt.update(
                { status: 2 },
                { where: { code_goods_receipt: code }, transaction: transaction }
            );

            if (updateResult[0] === 0) {
                throw new Error("Failed to update goods receipt status");
            }
        }

        async function getGoodsReceiptData() {
            const data = await model.log_goods_receipt.findAll({
                include: [
                    {
                        model: model.log_goods_receipt_detail,
                        include: {
                            model: model.log_item_master,
                            include: model.log_item_category
                        },
                        as: "details",
                        order: [['code_item', 'ASC']]
                    },
                    {
                        model: model.log_purchase_order,
                        include: [{
                            model: model.log_partners,
                            attributes: ["name", "code_partners_type", "code_partners"],
                            include: [model.log_partners_type]
                        }]
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                        as: "employeeWarehouse"
                    }
                ],
                where: { code_goods_receipt: code },
                transaction: transaction
            });

            if (!data || data.length === 0) {
                throw new Error("Goods receipt data not found");
            }
            return data;
        }

        async function processJournalEntries(goodsReceiptData) {
            const journalCode = await generateJournalCode(goodsReceiptData);
            const creditEntry = await createCreditJournalEntry(journalCode, goodsReceiptData);
            await createDebitJournalEntries(journalCode, creditEntry, goodsReceiptData);
            await updateBalanceMonthly(goodsReceiptData);
        }

        async function generateJournalCode(goodsReceiptData) {
            const { worksite } = goodsReceiptData[0].log_purchase_order;
            const dateGR = goodsReceiptData[0].date;
            const date = new Date(dateGR);
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
                transaction: transaction
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

        async function createCreditJournalEntry(journalCode, goodsReceiptData) {
            const {
                code_company,
                log_purchase_order: {
                    worksite,
                    log_partner: {
                        log_partners_type: { code_coa },
                        name: partners,
                        code_partners
                    },
                    exchange_rate
                },
                date,
                details
            } = goodsReceiptData[0];

            const totalPrice = details.reduce((sum, item) =>
                sum + (item.discounted_price * item.qty * exchange_rate), 0);

            return await model.fat_journal.create({
                code_journal: journalCode,
                code_company,
                worksite,
                code_coa,
                sequence_number: 1,
                description: `GR Form ${partners}`,
                dk_code: "C",
                amount: totalPrice,
                reference_code: goodsReceiptData[0].code_goods_receipt,
                code_partners,
                code_item: 0,
                date
            }, { transaction });
        }

        async function createDebitJournalEntries(journalCode, creditEntry, goodsReceiptData) {
            const {
                log_purchase_order: { exchange_rate },
                details,
                date,
                code_goods_receipt,
                log_purchase_order: { log_partner: { code_partners } }
            } = goodsReceiptData[0];

            const debitEntries = details.map((detail, index) => ({
                code_journal: journalCode,
                code_company: goodsReceiptData[0].code_company,
                worksite: goodsReceiptData[0].log_purchase_order.worksite,
                code_coa: detail.log_item_master.log_item_category.code_coa,
                sequence_number: index + 2,
                description: `GR Form ${goodsReceiptData[0].log_purchase_order.log_partner.name}`,
                dk_code: "D",
                amount: detail.discounted_price * detail.qty * exchange_rate,
                reference_code: code_goods_receipt,
                code_partners,
                code_item: detail.code_item,
                date
            }));

            return await model.fat_journal.bulkCreate(debitEntries, { transaction });
        }

        async function updateBalanceMonthly(goodsReceiptData) {
            const journalEntries = await model.fat_journal.findAll({
                where: { reference_code: goodsReceiptData[0].code_goods_receipt },
                transaction
            });

            const { code_company } = goodsReceiptData[0];
            const { worksite } = goodsReceiptData[0].log_purchase_order;
            const date = new Date(goodsReceiptData[0].date);
            const periodDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const exchangeRate = goodsReceiptData[0].log_purchase_order.exchange_rate;

            for (const entry of journalEntries) {
                const existingBalance = await model.fat_balance_monthly.findOne({
                    where: {
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: periodDate
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
                    await model.fat_balance_monthly.update(updateData, {
                        where: {
                            code_company,
                            worksite,
                            code_coa: entry.code_coa,
                            period_date: periodDate
                        },
                        transaction
                    });
                } else {
                    await model.fat_balance_monthly.create({
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

        async function processAssets(goodsReceiptData) {
            const { details } = goodsReceiptData[0];
            const { worksite } = goodsReceiptData[0].log_purchase_order;
            const purchaseOrder = goodsReceiptData[0].log_purchase_order.code_purchase_order;
            const date = goodsReceiptData[0].date;
            const year = date.split("-")[0];
            const yearMonth = date.split("-").slice(0, 2).join("-");
            const exchangeRate = goodsReceiptData[0].log_purchase_order.exchange_rate;

            for (const detail of details) {
                for (let i = 0; i < detail.qty; i++) {
                    const price = exchangeRate * detail.discounted_price;
                    await model.fat_asset.create({
                        worksite,
                        code_item: detail.code_item,
                        acquisition_year: year,
                        depreciation_start_month: yearMonth,
                        procurement_document: purchaseOrder,
                        historical_cost: price,
                        depreciation_value_monthly: 0,
                        depreciation_period_months: 0,
                        status: 0
                    }, { transaction });
                }
            }
        }

        async function updatePurchaseOrderDetails(goodsReceiptData) {
            const codePO = goodsReceiptData[0].code_purchase_order;

            for (const item of goodsReceiptData[0].details) {
                await model.log_purchase_order_detail.update(
                    { qty_received: Sequelize.literal(`qty_received + ${item.qty}`) },
                    {
                        where: {
                            [Op.and]: [
                                { code_purchase_order: codePO },
                                { code_item: item.code_item }
                            ]
                        },
                        transaction
                    }
                );
            }
        }

        async function checkPurchaseOrderCompletion(goodsReceiptData) {
            const codePO = goodsReceiptData[0].code_purchase_order;
            const details = await model.log_purchase_order_detail.findAll({
                where: { code_purchase_order: codePO },
                transaction
            });

            // Update status for completed items
            for (const detail of details) {
                if (detail.qty_received === detail.qty) {
                    await model.log_purchase_order_detail.update(
                        { status: 2 },
                        {
                            where: { code_purchase_order_detail: detail.code_purchase_order_detail },
                            transaction
                        }
                    );
                }
            }

            // Check if all items are completed
            const pendingItems = await model.log_purchase_order_detail.findAll({
                where: {
                    [Op.and]: [
                        { code_purchase_order: codePO },
                        { status: 1 }
                    ]
                },
                transaction
            });

            if (pendingItems.length === 0) {
                await completePurchaseOrder(codePO);
            } else {
                await transaction.commit();
                sendSuccessResponse(messages[language]?.postingData);
                logAction('success');
            }
        }

        async function completePurchaseOrder(codePO) {
            const updateResult = await model.log_purchase_order.update(
                { status: 2 },
                { where: { code_purchase_order: codePO }, transaction }
            );

            if (updateResult[0] > 0) {
                await transaction.commit();
                sendSuccessResponse(messages[language]?.postingData, updateResult);
                logAction('success');
            } else {
                await transaction.rollback();
                return sendFailedResponse(messages[language]?.userAccess);
            }
        }

        async function handleRejection() {
            await rejectApproval();
            await rejectGoodsReceipt();
            await rejectGoodsReceiptDetail();

            await transaction.commit();
            sendSuccessResponse(messages[language]?.updateData);
            logAction('success', 'Reject');
        }

        async function rejectApproval() {
            const updateResult = await model.log_purchase_request_approval.update(
                { status: 3 },
                {
                    where: {
                        [Op.and]: [
                            { employee_id: employeeID },
                            { code_goods_receipt: code }
                        ]
                    },
                    transaction
                }
            );

            if (updateResult[0] === 0) {
                throw new Error("Failed to update approval status");
            }
        }

        async function rejectGoodsReceipt() {
            const updateResult = await model.log_goods_receipt.update(
                { status: 3 },
                { where: { code_goods_receipt: code }, transaction }
            );

            if (updateResult[0] === 0) {
                throw new Error("Failed to update goods receipt status");
            }
        }

        async function rejectGoodsReceiptDetail() {
            const updateResult = await model.log_goods_receipt_detail.update(
                { status: 3 },
                { where: { code_goods_receipt: code }, transaction }
            );

            if (updateResult[0] === 0) {
                throw new Error("Failed to update purchase request details");
            }
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
            logger.info(`Update ${action} Goods Receipt Asset`, {
                "1.username": username,
                "2.module": `updateApprovalGoodsReceiptAsset`,
                "3.status": status,
                "4.action": req.body
            });
        }

    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error.message || error
        });
        logger.error('Update Approval Goods Receipt Asset Error', {
            "1.username": username,
            "2.module": "updateApprovalGoodsReceiptAsset",
            "3.status": "error",
            "4.error": error.message || error,
            "5.action": req.body
        });
    }
};
module.exports = controller;