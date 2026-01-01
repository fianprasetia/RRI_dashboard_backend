const model = require("../models/index")
const messages = require("./message")
const eppsLib = require('./epps');
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectGoodsIssue = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var codeWarehouse = req.body.code_warehouse_POST
        var startDate = req.body.start_date_POST
        var endDate = req.body.end_date_POST
        let selectGoodsIssueData = await model.log_goods_issue.findAll({
            include: [
                {
                    model: model.log_goods_issue_detail,
                    include: {
                        model: model.log_item_master
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
            ],
            where:
            {
                [Op.and]: [
                    { warehouse: codeWarehouse },
                    {
                        date: {
                            [Op.between]: [startDate, endDate]
                        },
                    },
                    {
                        status: {
                            [Sequelize.Op.not]: 4
                        },
                    }
                ]
            },
            transaction: transaction,
            order: [
                ['code_goods_issue', 'DESC'],
            ],
        });
        if (selectGoodsIssueData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectGoodsIssueData,
            });
        } else {
            await transaction.rollback()
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        await transaction.rollback()
        res.status(404).json({
            message: error,
        });
    }
}
controller.insertGoodsIssue = async function (req, res) {
    const transaction = await koneksi.transaction();
    let shouldRollback = false;
    try {
        // Extract request data
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            request_POST: request,
            date_POST: date,
            employeeID_POST: employeeCode,
            code_warehouse_POST: codeWarehouse,
            code_company_POST: codeCompany,
            note_POST: note,
            detail: details
        } = requestData;

        const yearAndMonth = date.split("-").slice(0, 2).join("-");
        const formattedDate = date.split("-").slice(0, 2).join("");
        // const itemCodes = details.map(item => item.code_item_POST);

        // Generate goods issue code
        const newCode = await generateGoodsIssueCode();

        let shouldRollback = false;
        // Insert goods issue
        await insertGoodsIssueRecord(newCode);

        // Process warehouse data and details
        const warehousePrices = await getWarehousePrices(details.map(item => item.code_POST));
        await insertGoodsIssueDetails(newCode, details, warehousePrices);

        // Handle approval process
        await processApproval(newCode);

        if (!shouldRollback) {
            await transaction.commit();
            sendSuccessResponse(messages[language]?.insertData);
            logAction('success');
        }
        // Helper functions
        async function generateGoodsIssueCode() {
            const existingIssues = await model.log_goods_issue.findAll({
                where: {
                    [Op.and]: [
                        { warehouse: codeWarehouse },
                        Sequelize.where(
                            Sequelize.fn('to_char', Sequelize.col('date'), 'YYYY-MM'),
                            yearAndMonth
                        )
                    ]
                },
                transaction
            });

            let sequenceNumber;
            if (existingIssues.length > 0) {
                const maxCode = Math.max(...existingIssues.map(issue =>
                    parseInt(issue.code_goods_issue.split("/")[0])
                ));
                sequenceNumber = (maxCode + 1).toString().padStart(3, "0");
            } else {
                sequenceNumber = "001";
            }

            return `${sequenceNumber}/GI/${codeCompany}/${codeWarehouse}/${formattedDate}`;
        }

        async function insertGoodsIssueRecord(code) {
            const goodsIssue = await model.log_goods_issue.create({
                code_goods_issue: code,
                code_company: codeCompany,
                warehouse: codeWarehouse,
                request_by: request,
                date: date,
                employee_id: employeeCode,
                note: note,
                status: 0
            }, { transaction });
            if (!goodsIssue) {
                shouldRollback = true;
                await transaction.rollback();
                return sendFailedResponse(messages[language]?.failedData);
            }
            return goodsIssue;
        }

        async function getWarehousePrices(itemCodes) {
            const prices = await model.log_warehouse.findAll({
                where: {
                    [Op.and]: [
                        { code_item: { [Op.in]: itemCodes } },
                        { warehouse: codeWarehouse },
                        { period: yearAndMonth }
                    ]
                },
                transaction
            });
            if (!prices || prices.length === 0) {
                shouldRollback = true;
                await transaction.rollback();
                // sendFailedResponse(messages[language]?.failedData);
                return sendFailedResponse(messages[language]?.failedData);
            }
            return prices;
        }

        async function insertGoodsIssueDetails(issueCode, items, warehousePrices) {
            const detailRecords = items.map((item, index) => {
                const priceData = warehousePrices[index];
                const price = (priceData.beginning_price * priceData.initial_qty +
                    priceData.incoming_price * priceData.incoming_qty) /
                    (priceData.initial_qty + priceData.incoming_qty);

                return {
                    code_goods_issue: issueCode,
                    code_item: item.code_POST,
                    qty: item.qty_POST,
                    worksite: item.block_POST,
                    asset_code: item.asset_POST,
                    code_activity: item.activity_POST,
                    outgoing_price: price,
                    status: 0
                };
            });

            const createdDetails = await model.log_goods_issue_detail.bulkCreate(
                detailRecords,
                { transaction }
            );

            if (!createdDetails) {
                shouldRollback = true;
                await transaction.rollback();
                return sendFailedResponse(messages[language]?.failedData);
            }
            return createdDetails;
        }

        async function processApproval(issueCode) {
            const approvers = await model.adm_approval.findAll({
                where: {
                    [Op.and]: [
                        { code_company: codeWarehouse },
                        { type_approval: "GI" }
                    ]
                },
                transaction,
                order: [['level_approval', 'ASC']]
            });

            if (!approvers || approvers.length === 0) {
                shouldRollback = true;
                await transaction.rollback();
                return sendFailedResponse(messages[language]?.userApproval);
            }

            const approvalRecords = approvers.map(approver => ({
                code_goods_issue: issueCode,
                employee_id: approver.employee_id,
                date: null,
                note: "",
                level_approval: approver.level_approval,
                status: 0
            }));

            const createdApprovals = await model.log_goods_issue_approval.bulkCreate(
                approvalRecords,
                { transaction }
            );

            if (!createdApprovals) {
                shouldRollback = true;
                await transaction.rollback();
                return sendFailedResponse(messages[language]?.failedData);
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
            logger.info('Insert Goods Issue', {
                "1.username": username,
                "2.module": 'insertGoodsIssue',
                "3.status": 'success',
                "4.action": req.body
            });
        }

    } catch (error) {
        if (!shouldRollback) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Rollback error:', rollbackError);
            }
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
                data: [],
            });
        } else {
            res.status(404).json({
                message: error.message,
            });
        }

        logger.error('Insert Goods Issue Error', {
            "1.username": req.body[0]?.username_POST || 'unknown',
            "2.module": 'insertGoodsIssue',
            "3.status": 'error',
            "4.error": error.message,
            "5.action": req.body
        });
    }
};
controller.selectGoodsIssueByCode = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var code = req.body.code_goods_issue_POST
        let selectGoodsIssueByCodeData = await model.log_goods_issue.findAll({
            include: [
                {
                    model: model.log_goods_issue_detail,
                    include: [
                        {
                            model: model.log_item_master
                        },
                        {
                            model: model.adm_activity,
                            include:
                            {
                                model: model.adm_activity_translations,
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
                    model: model.hrd_employee,
                    attributes: ["fullname"],
                    as: "employeeWarehouse"
                },
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"],
                    as: "employeeRequest"
                },
                {
                    model: model.adm_signature,
                    as: "employeeSignature"
                },
                {
                    model: model.log_goods_issue_approval,
                    include: {
                        model: model.hrd_employee,
                        attributes: ["fullname"]
                    },
                },
            ],
            where:
            {
                [Op.and]:
                    [
                        { code_goods_issue: code, },
                        {
                            status: {
                                [Sequelize.Op.not]: 3
                            },
                        }
                    ]
            },
            order: [
                [model.log_goods_issue_approval, 'level_approval', 'ASC']
            ],
            transaction: transaction,
        });
        if (selectGoodsIssueByCodeData.length > 0) {

            selectSignature(selectGoodsIssueByCodeData)
        } else {
            await transaction.rollback()
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectSignature(selectGoodsIssueByCodeData) {
            var jmlData = selectGoodsIssueByCodeData[0]["log_goods_issue_approvals"].length;
            let arrIdSignature = [];
            for (var i = 0; i < jmlData; i++) {
                arrIdSignature.push(selectGoodsIssueByCodeData[0]["log_goods_issue_approvals"][i]["employee_id"]);
            }

            let selectSignatureData = await model.adm_signature.findAll({
                where:
                {
                    employee_id: arrIdSignature
                },
            });
            var data = {
                dataGI: selectGoodsIssueByCodeData,
                dataSignature: selectSignatureData
            }
            if (selectSignatureData.length > 0) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    data: data,
                });
            } else {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    data: data,
                });
            }
        }
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}
controller.updateGoodsIssue = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            goods_issue_POST: codeGoodsIssue,
            request_POST: request,
            date_POST: date,
            employeeID_POST: employeeCode,
            code_warehouse_POST: codeWarehouse,
            code_company_POST: codeCompany,
            note_POST: note,
            detail: details
        } = requestData;

        const yearAndMonth = date.split("-").slice(0, 2).join("-");
        const formattedDate = date.split("-").slice(0, 2).join("");
        const itemCodes = details.map(item => item.code_item_POST);

        // Fungsi update goods issue record
        const updateGoodsIssueRecord = async () => {
            const goodsIssue = await model.log_goods_issue.update(
                {
                    date,
                    request_by: request,
                    note
                },
                {
                    where: { code_goods_issue: codeGoodsIssue },
                    transaction
                }
            );

            if (!goodsIssue) {
                throw new Error("Failed to create goods issue record");
            }
            return goodsIssue;
        };

        // Fungsi mendapatkan harga warehouse
        const getWarehousePrices = async (itemCodes) => {
            const prices = await model.log_warehouse.findAll({
                where: {
                    [Op.and]: [
                        { code_item: { [Op.in]: itemCodes } },
                        { warehouse: codeWarehouse },
                        { period: yearAndMonth }
                    ]
                },
                transaction
            });

            if (!prices || prices.length === 0) {
                throw new Error("Warehouse prices not found");
            }
            return prices;
        };

        // Fungsi untuk menghapus detail goods issue
        const deleteGoodsIssueDetail = async () => {
            await model.log_goods_issue_detail.destroy({
                where: { code_goods_issue: codeGoodsIssue },
                transaction
            });
        };

        // Fungsi untuk menyisipkan detail goods issue
        const insertGoodsIssueDetails = async (items, warehousePrices) => {
            const detailRecords = items.map((item, index) => {
                const priceData = warehousePrices[index];
                const price = (priceData.beginning_price * priceData.initial_qty + priceData.incoming_price * priceData.incoming_qty) / (priceData.initial_qty + priceData.incoming_qty);

                return {
                    code_goods_issue: codeGoodsIssue,
                    code_item: item.code_POST,
                    qty: item.qty_POST,
                    worksite: item.block_POST,
                    asset_code: item.asset_POST,
                    code_activity: item.activity_POST,
                    outgoing_price: price,
                    status: 0
                };
            });

            const createdDetails = await model.log_goods_issue_detail.bulkCreate(
                detailRecords,
                { transaction }
            );

            if (!createdDetails) {
                throw new Error("Failed to create goods issue details");
            }

            await transaction.commit();

            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: createdDetails
            });

            logger.info('Insert Goods Issue', {
                "1.username": username,
                "2.module": 'insertGoodsIssue',
                "3.status": 'success',
                "4.action": req.body
            });
        };

        // Menjalankan proses secara berurutan
        await updateGoodsIssueRecord();
        const warehousePrices = await getWarehousePrices(details.map(item => item.code_POST));
        await deleteGoodsIssueDetail();
        await insertGoodsIssueDetails(details, warehousePrices);

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

        logger.error('Insert Goods Issue Error', {
            "1.username": req.body[0]?.username_POST || 'unknown',
            "2.module": 'insertGoodsIssue',
            "3.status": 'error',
            "4.error": error.message,
            "5.action": []
        });
    }
};
controller.updatePostingGoodsIssue = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const code = req.body.goods_issue_POST
        const username = req.body.username_POST
        let updatePostingGoodsIssueData = await model.log_goods_issue.update(
            {
                status: 1,
            },
            {
                where:
                {
                    code_goods_issue: code
                },
                transaction: transaction
            },
        );
        if (updatePostingGoodsIssueData) {
            await updatePostingGoodsIssueDetail()
        } else {
            await transaction.rollback()
            return res.status(200).json({
                message: " Tidak ada data",
                data: [],
            });
        }
        async function updatePostingGoodsIssueDetail() {
            let updatePostingGoodsIssueDetailData = await model.log_goods_issue_detail.update(
                {
                    status: 1,
                },
                {
                    where: {
                        code_goods_issue: code
                    },
                    transaction: transaction
                }
            )
            if (updatePostingGoodsIssueDetailData) {
                await selectUserApproval()
            } else {
                await transaction.rollback();
                return res.status(200).json({
                    access: "failed",
                    message: messages[language]?.nodata,
                });
            }
        }
        async function selectUserApproval() {
            let selectUserApprovalData = await model.log_goods_issue_approval.findAll({
                where: {
                    code_goods_issue: code
                },
                order: [
                    ['createdAt', 'ASC']
                ],
                transaction: transaction
            })
            if (selectUserApprovalData.length > 0) {
                updateUserApproval(selectUserApprovalData)
            } else {
                await transaction.rollback();
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.nodata,
                });
            }
        }
        async function updateUserApproval(selectUserApprovalData) {
            const user = selectUserApprovalData[0].employee_id
            const today = new Date();
            let updateUserApprovalData = await model.log_goods_issue_approval.update(
                {
                    status: 1,
                },
                {
                    where:
                    {
                        [Op.and]:
                            [
                                {
                                    employee_id: user
                                },
                                {
                                    code_goods_issue: code
                                }
                            ]
                    },
                    transaction: transaction
                }
            )
            if (updateUserApprovalData.length > 0) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: updateUserApprovalData,
                });
                logger.info('Update Posting Goods Issue', {
                    "1.username": `${username}`,
                    "2.module": 'updatePostingGoodsIssue',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback();
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.userAccess,
                });
            }
        }
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({
            message: error.message,
        });
    }
}
controller.deleteGoodsIssue = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const code = req.body.code_goods_issue_POST
        var username = req.body.username_POST
        let deleteGoodsIssueData = await model.log_goods_issue.update(
            {
                status: 4,
            },
            {
                where:
                {
                    code_goods_issue: code
                },
                transaction: transaction
            },
        );
        if (deleteGoodsIssueData) {
            deletePurchaseIssueDetail()
        } else {
            await transaction.rollback()
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function deletePurchaseIssueDetail() {
            let deletePurchaseIssueDetailData = await model.log_goods_issue_detail.update(
                {
                    status: 4,
                },
                {
                    where: {
                        code_goods_issue: code
                    },
                    transaction: transaction
                }
            )
            if (deletePurchaseIssueDetailData) {
                deletePostingGoodsIssueApproval()
            } else {
                await transaction.rollback();
                return res.status(200).json({
                    access: "failed",
                    message: messages[language]?.nodata,
                });
            }
        }
        async function deletePostingGoodsIssueApproval() {
            let deletePostingGoodsIssueApprovalData = await model.log_goods_issue_approval.update(
                {
                    status: 4,
                },
                {
                    where: {
                        code_goods_issue: code
                    },
                    transaction: transaction
                }
            )
            if (deletePostingGoodsIssueApprovalData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.deleteData,
                });
                logger.info('Delete Purchase Issue', {
                    "1.username": `${username}`,
                    "2.module": 'deleteGoodsIssue',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback();
                return res.status(200).json({
                    access: "failed",
                    message: messages[language]?.nodata,
                });
            }
        }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error,
        });
    }
}

module.exports = controller;