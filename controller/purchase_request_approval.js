const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectApprovalPurchaseRequest = async function (req, res) {
    try {
        var language = req.body.language_POST
        var employee = req.body.employeeID_POST
        let selectApprovalPurchaseRequestData = await model.log_purchase_request_approval.findAll({
            include: [
                {
                    model: model.log_purchase_request,
                    include: [
                        {
                            model: model.adm_company,
                            attributes: ["name"]
                        },
                        {
                            model: model.hrd_employee,
                            attributes: ["fullname"]
                        },
                    ],
                },
            ],
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
                [model.log_purchase_request, 'createdAt', 'ASC']
            ],
        });
        if (selectApprovalPurchaseRequestData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectApprovalPurchaseRequestData,
            });
        } else {
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
controller.updateApprovalPurchaseRequest = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        const username = req.body.username_POST
        var employeeID = req.body.employeeID_POST
        var code = req.body.code_purchase_request_POST
        var note = req.body.note_POST
        var dateApprove = req.body.date_approve_POST
        var status = req.body.status_POST
        let updatePurchaseRequestData = await model.log_purchase_request_approval.update(
            {
                date: dateApprove,
                note: note,
                status: status
            },
            {
                where:
                {
                    [Op.and]:
                        [
                            { code_purchase_request: code, },
                            { employee_id: employeeID },
                        ]
                },
                transaction: transaction
            },
        );
        if (status == 2) {
            await selectUserApproval()
        } else {
            await updateRejectUserApproval()
        }
        async function selectUserApproval() {
            let selectUserApprovalData = await model.log_purchase_request_approval.findAll({
                where:
                {
                    [Op.and]:
                        [
                            { code_purchase_request: code, },
                            { status: 0 },
                        ]
                },
                order: [
                    ['level_approval', 'ASC']
                ],
                transaction: transaction
            })

            if (selectUserApprovalData.length > 0) {
                updateUserApproval(selectUserApprovalData)
            } else {
                updatePurchaseRequest()
            }
        }
        async function updateUserApproval(selectUserApprovalData) {
            const user = selectUserApprovalData[0].employee_id
            const today = new Date();
            let updateUserApprovalData = await model.log_purchase_request_approval.update(
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
                                    code_purchase_request: code
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
                logger.info('Update Approval Purchase Request', {
                    "1.username": `${username}`,
                    "2.module": 'updateApprovalPurchaseRequest',
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
        async function updatePurchaseRequest() {
            let updatePurchaseRequestData = await model.log_purchase_request.update(
                {
                    status: 2,
                },
                {
                    where:
                    {
                        code_purchase_request: code
                    },
                    transaction: transaction
                }
            )
            if (updatePurchaseRequestData.length > 0) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: updatePurchaseRequestData,
                });
                logger.info('Update Approval Purchase Request', {
                    "1.username": `${username}`,
                    "2.module": 'updateApprovalPurchaseRequest',
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
        async function updateRejectUserApproval() {
            const today = new Date();
            let updateUserApprovalData = await model.log_purchase_request_approval.update(
                {
                    status: 3,
                },
                {
                    where:
                    {
                        [Op.and]:
                            [
                                {
                                    employee_id: employeeID
                                },
                                {
                                    code_purchase_request: code
                                }
                            ]
                    },
                    transaction: transaction
                }
            )
            if (updateUserApprovalData.length > 0) {
                updateRejectPurchaseRequest()
            } else {
                await transaction.rollback();
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.userAccess,
                });
            }
        }
        async function updateRejectPurchaseRequest() {
            let updateRejectPurchaseRequestData = await model.log_purchase_request.update(
                {
                    status: 5,
                },
                {
                    where:
                    {
                        code_purchase_request: code
                    },
                    transaction: transaction
                }
            )
            if (updateRejectPurchaseRequestData.length > 0) {
                updateRejectPurchaseRequestDetail()
            } else {
                await transaction.rollback();
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.userAccess,
                });
            }
        }
        async function updateRejectPurchaseRequestDetail() {
            let updateRejectPurchaseRequestDetailData = await model.log_purchase_request_detail.update(
                {
                    status: 4,
                },
                {
                    where:
                    {
                        code_purchase_request: code
                    },
                    transaction: transaction
                }
            )
            if (updateRejectPurchaseRequestDetailData.length > 0) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: updateRejectPurchaseRequestDetailData,
                });
                logger.info('Update Approval Purchase Request (Reject)', {
                    "1.username": `${username}`,
                    "2.module": 'updateApprovalPurchaseRequest',
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
        res.status(404).json({
            message: error,
        });
    }
}




module.exports = controller;