const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")
const logger = require('./logger');


controller.selectApprovalGoodsIssue = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var employee = req.body.employeeID_POST
        let selectApprovalGoodsIssueData = await model.log_goods_issue_approval.findAll({
            include:
            {
                model: model.log_goods_issue,
                include: [
                    {
                        model: model.log_goods_issue_detail,
                        include: {
                            model: model.log_item_master,
                        },
                        as: "details"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                        as: "employeeWarehouse"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                        as: "employeeRequest"
                    },
                ]
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
        if (selectApprovalGoodsIssueData.length > 0) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                data: selectApprovalGoodsIssueData,
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
controller.updateApprovalGoodsIssue = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        // Destructure request body
        const {
            language_POST: language,
            username_POST: username,
            employeeID_POST: employeeID,
            code_goods_issue_POST: code,
            note_POST: note,
            date_approve_POST: dateApprove,
            status_POST: status
        } = req.body;

        // Update goods receipt approval status
        await updateGoodsIssueApproval();

        if (status == 2) {
            await handleApproval();
        } else {
            await handleRejection();
        }

        // Helper functions
        async function updateGoodsIssueApproval() {
            return await model.log_goods_issue_approval.update(
                {
                    date: dateApprove,
                    note: note,
                    status: status
                },
                {
                    where: {
                        [Op.and]: [
                            { code_goods_issue: code },
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
                await completeGoodsIssueApproval();
            }
        }

        async function getNextApprovers() {
            return await model.log_goods_issue_approval.findAll({
                where: {
                    [Op.and]: [
                        { code_goods_issue: code },
                        { status: 0 }
                    ]
                },
                order: [['level_approval', 'ASC']],
                transaction
            });
        }

        async function approveNextUser(user) {
            const updateResult = await model.log_goods_issue_approval.update(
                { status: 1 },
                {
                    where: {
                        [Op.and]: [
                            { employee_id: user.employee_id },
                            { code_goods_issue: code }
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

        async function completeGoodsIssueApproval() {
            await updateGoodsIssueStatus();
            const goodsIssueData = await getGoodsIssueData();
            await processJournalEntries(goodsIssueData);
            await updateWarehouseRecords(goodsIssueData);
            await updateGoodsIssueDetailStatus();
        }

        async function updateGoodsIssueStatus() {
            const updateResult = await model.log_goods_issue.update(
                { status: 2 },
                { where: { code_goods_issue: code }, transaction }
            );

            if (updateResult[0] === 0) {
                throw new Error("Failed to update goods receipt status");
            }
        }

        async function getGoodsIssueData() {
            const data = await model.log_goods_issue.findAll({
                include: [
                    {
                        model: model.log_goods_issue_detail,
                        include:
                            [
                                {
                                    model: model.log_item_master,
                                    include: model.log_item_category
                                },
                                {
                                    model: model.adm_activity,
                                }
                            ],
                        as: "details",
                        order: [['code_item', 'ASC']]
                    },
                    {
                        model: model.adm_company,
                    },
                ],
                where: { code_goods_issue: code },
                transaction
            });
            if (!data || data.length === 0) {
                throw new Error("Goods receipt data not found");
            }
            return data;
        }

        async function processJournalEntries(goodsIssueData) {
            const journalCode = await generateJournalCode(goodsIssueData);
            await createCreditJournalEntry(journalCode, goodsIssueData);
            await createDebitJournalEntries(journalCode, goodsIssueData);
            await updateBalanceMonthly(goodsIssueData);
        }

        async function generateJournalCode(goodsIssueData) {
            const worksite = goodsIssueData[0].adm_company.code_company;
            const dateGI = goodsIssueData[0].date;
            const date = new Date(dateGI);
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

        async function createCreditJournalEntry(journalCode, goodsIssueData) {
            const {
                code_company,
                adm_company: {
                    parent_code,
                },
                details: [
                    {
                        adm_activity: { code_coa },
                        log_item_master: { name }
                    },
                ],
                date,
                details,
            } = goodsIssueData[0];

            const totalPrice = details.reduce((sum, item) =>
                sum + (item.qty * item.outgoing_price), 0);
            return await model.fat_journal.create({
                code_journal: journalCode,
                code_company: parent_code,
                worksite: code_company,
                code_coa,
                sequence_number: 1,
                description: `GI for ${name} Usage`,
                dk_code: "D",
                amount: totalPrice,
                reference_code: goodsIssueData[0].code_goods_issue,
                code_partners: "",
                code_item: 0,
                date
            }, { transaction });
        }

        async function createDebitJournalEntries(journalCode, goodsIssueData) {
            const {
                code_goods_issue,
                details,
                date,
            } = goodsIssueData[0];

            const debitEntries = details.map((detail, index) => ({
                code_journal: journalCode,
                code_company: goodsIssueData[0].adm_company.parent_code,
                worksite: goodsIssueData[0].code_company,
                code_coa: detail.log_item_master.log_item_category.code_coa,
                sequence_number: index + 2,
                description: `GI for ${detail.log_item_master.name} Usage`,
                dk_code: "C",
                amount: detail.qty * detail.outgoing_price,
                reference_code: code_goods_issue,
                code_partners: "",
                code_item: detail.log_item_master.code_item,
                date
            }));
            return await model.fat_journal.bulkCreate(debitEntries, { transaction });
        }

        async function updateBalanceMonthly(goodsIssueData) {
            const journalEntries = await model.fat_journal.findAll({
                where: { reference_code: goodsIssueData[0].code_goods_issue },
                transaction
            });
            const code_company = goodsIssueData[0].adm_company.parent_code;
            const worksite = goodsIssueData[0].code_company;
            const date = new Date(goodsIssueData[0].date);
            const periodDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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
                const amount = entry.amount;
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

        async function updateWarehouseRecords(goodsIssueData) {
            const code_company = goodsIssueData[0].adm_company.parent_code;
            const { warehouse } = goodsIssueData[0];
            const { details } = goodsIssueData[0];
            const date = new Date(goodsIssueData[0].date);
            const periodDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

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
                await updateExistingWarehouseItems(updateItems, code_company, warehouse, periodDate);
            }
            if (newItems.length > 0) {
                await createNewWarehouseItems(newItems, code_company, warehouse, periodDate);
            }
        }

        async function updateExistingWarehouseItems(items, codeCompany, warehouse, periodDate) {
            for (const item of items) {
                await model.log_warehouse.update(
                    {
                        outgoing_qty: Sequelize.literal(`outgoing_qty + ${item.qty}`),
                        outgoing_price: item.outgoing_price
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
                outgoing_qty: item.qty,
                outgoing_price: item.outgoing_price
            }));

            await model.log_warehouse.bulkCreate(warehouseEntries, { transaction });
        }

        async function updateGoodsIssueDetailStatus() {
            const updateResult = await model.log_goods_issue_detail.update(
                { status: 2 },
                { where: { code_goods_issue: code }, transaction }
            );
            if (updateResult[0] === 0) {
                await transaction.rollback();
               return sendFailedResponse(messages[language]?.postingCorrect);
            } else {
                await transaction.commit();
                sendSuccessResponse(messages[language]?.postingData);
                logAction('success');
            }
        }

        async function handleRejection() {
            await rejectApproval();
            await rejectGoodsIssue();
            await rejectGoodsIssueDetail();

            await transaction.commit();
            sendSuccessResponse(messages[language]?.updateData);
            logAction('success', 'Reject');
        }

        async function rejectApproval() {
            const updateResult = await model.log_purchase_issue_approval.update(
                { status: 3 },
                {
                    where: {
                        [Op.and]: [
                            { employee_id: employeeID },
                            { code_goods_issue: code }
                        ]
                    },
                    transaction
                }
            );

            if (updateResult[0] === 0) {
                throw new Error("Failed to update approval status");
            }
        }

        async function rejectGoodsIssue() {
            const updateResult = await model.log_goods_issue.update(
                { status: 2 },
                { where: { code_goods_issue: code }, transaction }
            );

            if (updateResult[0] === 0) {
                throw new Error("Failed to update goods issue status");
            }
        }

        async function rejectGoodsIssueDetail() {
            const updateResult = await model.log_goods_issue.update(
                { status: 2 },
                { where: { code_goods_issue: code }, transaction }
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
            logger.info(`Update ${action} Goods Issue`, {
                "1.username": username,
                "2.module": "updateApprovalGoodsIssue",
                "3.status": status,
                "4.action": req.body
            });
        }

    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error.message || error
        });
    }
};
module.exports = controller;