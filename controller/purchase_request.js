const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectPurchaseRequest = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        // var language = req.body.language_POST
        var employee = req.body.employeeID_POST
        let selectPurchaseRequestData = await model.log_purchase_request.findAll({
            include: [
                // {
                //     model: model.log_purchase_request_detail,
                //     include:{
                //         model:model.log_item_master

                //     }
                // },
                // {
                //     model: model.adm_company,
                //     attributes:["name"]
                // },
                // {
                //     model:model.log_purchase_request_approval,
                //      include:{
                //         model:model.hrd_employee,
                //         attributes:["fullname"]

                //     }

                // }
            ],
            where:
            {
                [Op.and]:
                    [
                        { employee_id: employee, },
                        {
                            status: {
                                [Sequelize.Op.not]: 6
                            },
                        }
                    ]
            },
            transaction: transaction,
            order: [
                ['createdAt', 'DESC'],
            ],
        });
        if (selectPurchaseRequestData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectPurchaseRequestData,
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
        res.status(404).json({
            message: error,
        });
    }
}
controller.selectPurchaseRequestByCode = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        // var language = req.body.language_POST
        var code = req.body.code_purchase_request_POST
        let selectPurchaseRequestByCodeData = await model.log_purchase_request.findAll({
            include: [
                {
                    model: model.log_purchase_request_detail,
                    include: {
                        model: model.log_item_master
                    },
                },
                {
                    model: model.log_purchase_request_approval,
                    include: {
                        model: model.hrd_employee,
                        attributes: ["fullname"]
                    },
                },
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"]
                },
                {
                    model: model.hrd_employee,
                    as: "employeePurchasing",
                    attributes: ["fullname"]
                },
            ],
            where:
            {
                [Op.and]:
                    [
                        { code_purchase_request: code, },
                        {
                            status: {
                                [Sequelize.Op.not]: 6
                            },
                        }
                    ]
            },
            order: [
                [model.log_purchase_request_approval, 'level_approval', 'ASC']
            ],
            transaction: transaction,
        });
        if (selectPurchaseRequestByCodeData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectPurchaseRequestByCodeData,
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
        res.status(404).json({
            message: error,
        });
    }
}
controller.selectPurchaseRequestDelegation = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        // var code = req.body.code_purchase_request_POST
        let selectPurchaseRequestDelegationData = await model.log_purchase_request.findAll({
            include: [
                {
                    model: model.log_purchase_request_detail,
                    include: {
                        model: model.log_item_master

                    }
                },
                {
                    model: model.log_purchase_request_approval,
                    include: {
                        model: model.hrd_employee,
                        attributes: ["fullname"]
                    },
                },
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"]
                },
                {
                    model: model.hrd_employee,
                    as: "employeePurchasing",
                    attributes: ["fullname"]
                },
                {
                    model: model.adm_company,
                    attributes: ["name"]
                },
            ],
            where:
            {
                status: {
                    [Op.in]: ['2', '3']
                }
            },
            order: [
                ['createdAt', 'DESC']
            ],
            transaction: transaction,
        });
        if (selectPurchaseRequestDelegationData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectPurchaseRequestDelegationData,
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
        res.status(404).json({
            message: error,
        });
    }
}
controller.selectPurchaseRequestQuotation = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var employee = req.body.employee_POST
        var language = req.body.language_POST
        let selectPurchaseRequestQuotationData = await model.log_purchase_request.findAll({
            include: [
                {
                    model: model.log_purchase_request_detail,
                    include: {
                        model: model.log_item_master

                    }
                },
                {
                    model: model.log_purchase_request_approval,
                    include: {
                        model: model.hrd_employee,
                        attributes: ["fullname"]
                    },
                },
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"]
                },
                {
                    model: model.hrd_employee,
                    as: "employeePurchasing",
                    attributes: ["fullname"]
                },
                {
                    model: model.adm_company,
                    attributes: ["name"]
                },
            ],
            where:
            {
                [Op.and]:
                    [
                        { employee_purchasing: employee, },
                        { status: 3 }
                    ]
            },
            order: [
                ['createdAt', 'DESC']
            ],
            transaction: transaction,
        });
        if (selectPurchaseRequestQuotationData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectPurchaseRequestQuotationData,
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
        res.status(404).json({
            message: error,
        });
    }
}
controller.insertPurchaseRequest = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body[0]["language_POST"]
        const username = req.body[0]["username_POST"]
        var codeCompany = req.body[0]["company_code_POST"]
        var type = req.body[0]["type_POST"]
        var dateRequest = req.body[0]["date_request_POST"]
        var dateCreate = req.body[0]["date_create_POST"]
        var note = req.body[0]["node_header_POST"]
        var employeeCode = req.body[0]["employeeID_POST"]
        const yearAndMonth = dateCreate.split("-").slice(0, 2).join("-");
        const formattedDate = dateCreate.split("-").slice(0, 2).join("");
        var selectPurchaseRequestData = await model.log_purchase_request.findAll({
            where:
            {
                [Op.and]: [
                    { code_company: codeCompany },
                    { type: type },
                    Sequelize.where(
                        Sequelize.fn('to_char', Sequelize.col('date'), 'YYYY-MM'), // Format tanggal menjadi 'YYYY-MM'
                        yearAndMonth // '2024-12'
                    )
                ]
            },
            transaction: transaction
        }
        );
        if (selectPurchaseRequestData.length > 0) {
            var idsubstring = []
            var idsubstringPush = []
            var idsubstringMax
            for (var i = 0; i < selectPurchaseRequestData.length; i++) {
                idsubstring = selectPurchaseRequestData[i]['code_purchase_request'].split("/")[0];
                idsubstringPush.push(idsubstring);
                idsubstringMax = Math.max.apply(null, idsubstringPush)
            }
            var endsubstringCodeInt = parseInt(idsubstringMax) + 1
            let noUrut = (endsubstringCodeInt.toString()).padStart(3, "0")
            newCode = noUrut + "/PR/" + codeCompany + "/" + type + "/" + formattedDate
            insertPurchaseRequest(newCode)
        } else {
            no = "1"
            let noUrut = no.padStart(3, "0")
            newCode = noUrut + "/PR/" + codeCompany + "/" + type + "/" + formattedDate
            insertPurchaseRequest(newCode)
        }
        async function insertPurchaseRequest(newCode) {
            var insertPurchaseRequestData = await model.log_purchase_request.create(
                {
                    code_purchase_request: newCode,
                    code_company: codeCompany,
                    employee_id: employeeCode,
                    employee_purchasing: null,
                    date: dateCreate,
                    date_request: dateRequest,
                    note: note,
                    type: type,
                    status: 0,
                },
                {
                    transaction: transaction
                }
            );
            if (insertPurchaseRequestData) {
                insertPurchaseRequestDetail(newCode)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }

        }
        async function insertPurchaseRequestDetail(newCode) {
            jmlData = req.body[0]["detail"]
            var dataPurcasheRequestDetail = []
            for (var i = 0; i < jmlData.length; i++) {
                newCodeDetail = JSON.parse('{"code_purchase_request": "' + newCode + '"}')
                codeItemDetail = JSON.parse('{"code_item": "' + req.body[0]["detail"][i].code_POST + '"}')
                noteDetail = JSON.parse('{"note": "' + req.body[0]["detail"][i].noted_POST + '"}')
                qtyRequestDetail = JSON.parse('{"qty_request": ' + req.body[0]["detail"][i].qty_POST + '}')
                qtyActualDetail = JSON.parse('{"qty_actual": ' + req.body[0]["detail"][i].qty_POST + '}')
                qrtRfqDetail = JSON.parse('{"qty_rfq": 0}')
                statusDetail = JSON.parse('{"status": 0}')
                extend(newCodeDetail, codeItemDetail, noteDetail, qtyRequestDetail, qtyActualDetail, qrtRfqDetail, statusDetail);
                dataPurcasheRequestDetail.push(newCodeDetail);
            }
            var dataPurcasheRequestDetailData = await model.log_purchase_request_detail.bulkCreate(
                dataPurcasheRequestDetail,
                {
                    transaction: transaction
                }
            );
            if (dataPurcasheRequestDetailData) {
                // await transaction.commit()
                // res.status(200).json({
                //     access: "success",
                //     message: messages[language]?.insertData,
                //     data: dataPurcasheRequestDetailData,
                // });
                selectUserApproval(newCode)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }
        }
        async function selectUserApproval(newCode) {
            var selectUserApprovalData = await model.adm_approval.findAll({
                where: {
                    [Op.and]: [
                        { code_company: codeCompany },
                        { type_approval: type }
                    ]
                },
                transaction: transaction,
                order: [
                    ['createdAt', 'ASC'],
                ],

            });

            if (selectUserApprovalData.length > 0) {
                // await transaction.commit()
                // res.status(200).json({
                //     access: "success",
                //     message: messages[language]?.insertData,
                //     data: dataPurcasheRequestDetailData,
                // });
                insertUserApproval(newCode, selectUserApprovalData)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.userApproval,
                });
            }
        }
        async function insertUserApproval(newCode, selectUserApprovalData) {
            jmlData = selectUserApprovalData.length
            var dataUserApproval = []
            for (var i = 0; i < jmlData; i++) {
                newCodeApproval = JSON.parse('{"code_purchase_request": "' + newCode + '"}')
                employeeApproval = JSON.parse('{"employee_id": "' + selectUserApprovalData[i].employee_id + '"}')
                dateApproval = JSON.parse('{"date": null}')
                noteApproval = JSON.parse('{"note": ""}')
                levelApproval = JSON.parse('{"level_approval": ' + selectUserApprovalData[i].level_approval + '}')
                statusDetail = JSON.parse('{"status": 0}')
                extend(newCodeApproval, employeeApproval, dateApproval, noteApproval, levelApproval, statusDetail);
                dataUserApproval.push(newCodeApproval);
            }

            var insertUserApprovalData = await model.log_purchase_request_approval.bulkCreate(
                dataUserApproval,
                {
                    transaction: transaction
                }
            );

            if (insertUserApprovalData) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertUserApprovalData,
                });
                logger.info('Insert Purchase Request', {
                    "1.username": `${username}`,
                    "2.module": 'insertPurchaseRequest',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }
        }
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
                data: [], // Tidak ada data yang disimpan karena duplikasi
            });
        } else {
            // Tangani error lain yang tidak terduga
            await transaction.rollback();
            res.status(404).json({
                message: error.message,
            });
        }
    }
}
controller.updatePostingPurchaseRequest = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const username = req.body.username_POST
        const code = req.body.code_purchase_request_POST
        let updatePostingPurchaseRequestData = await model.log_purchase_request.update(
            {
                status: 1,
            },
            {
                where:
                {
                    code_purchase_request: code
                },
                transaction: transaction
            },
        );
        if (updatePostingPurchaseRequestData) {
            selectUserApproval()
        } else {
            await transaction.rollback()
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectUserApproval() {
            let selectUserApprovalData = await model.log_purchase_request_approval.findAll({
                where: {
                    code_purchase_request: code
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
                logger.info('Update Posting Purchase Request', {
                    "1.username": `${username}`,
                    "2.module": 'updatePostingPurchaseRequest',
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
controller.deletePurchaseRequest = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const username = req.body.username_POST
        const code = req.body.code_purchase_request_POST
        let deletePostingPurchaseRequestData = await model.log_purchase_request.update(
            {
                status: 6,
            },
            {
                where:
                {
                    code_purchase_request: code
                },
                transaction: transaction
            },
        );
        if (deletePostingPurchaseRequestData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.deleteData,
            });
            logger.info('Delete Purchase Request', {
                "1.username": `${username}`,
                "2.module": 'deletePurchaseRequest',
                "3.status": 'success',
                "4.action": req.body
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
controller.updatePurchaseRequest = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body[0]["language_POST"]
        const username = req.body[0]["username_POST"]
        var code = req.body[0]["code_header_POST"]
        var dateRequest = req.body[0]["date_request_POST"]
        var note = req.body[0]["node_header_POST"]
        let updatePurchaseRequestData = await model.log_purchase_request.update(
            {
                date_request: dateRequest,
                note: note
            },
            {
                where:
                {
                    code_purchase_request: code
                },
                transaction: transaction
            },
        );
        if (updatePurchaseRequestData) {
            deletePurchaseRequestDetail()
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }

        async function deletePurchaseRequestDetail() {
            let deletePurchaseRequestDetailData = await model.log_purchase_request_detail.destroy({
                where: {
                    code_purchase_request: code
                },
                transaction: transaction
            });
            if (deletePurchaseRequestDetailData) {
                insertPurchaseRequestDetail()
            } else {
                await transaction.rollback();
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
        async function insertPurchaseRequestDetail() {
            jmlData = req.body[0]["detail"]
            var dataPurcasheRequestDetail = []
            for (var i = 0; i < jmlData.length; i++) {
                newCodeDetail = JSON.parse('{"code_purchase_request": "' + code + '"}')
                codeItemDetail = JSON.parse('{"code_item": "' + req.body[0]["detail"][i].code_POST + '"}')
                noteDetail = JSON.parse('{"note": "' + req.body[0]["detail"][i].noted_POST + '"}')
                qtyRequestDetail = JSON.parse('{"qty_request": ' + req.body[0]["detail"][i].qty_POST + '}')
                qtyActualDetail = JSON.parse('{"qty_actual": ' + req.body[0]["detail"][i].qty_POST + '}')
                qrtRfqDetail = JSON.parse('{"qty_rfq": 0}')
                statusDetail = JSON.parse('{"status": 0}')
                extend(newCodeDetail, codeItemDetail, noteDetail, qtyRequestDetail, qtyActualDetail, statusDetail);
                dataPurcasheRequestDetail.push(newCodeDetail);
            }
            var dataPurcasheRequestDetailData = await model.log_purchase_request_detail.bulkCreate(
                dataPurcasheRequestDetail,
                {
                    transaction: transaction
                }
            );

            if (dataPurcasheRequestDetailData) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: dataPurcasheRequestDetailData,
                });
                logger.info('Update Purchase Request', {
                    "1.username": `${username}`,
                    "2.module": 'updatePurchaseRequest',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }
        }
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
                data: [], // Tidak ada data yang disimpan karena duplikasi
            });
        } else {
            await transaction.rollback();
            res.status(404).json({
                message: error.message,
            });
        }
    }
}
controller.updatePurchaseRequestDelegation = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body[0]["language_POST"]
        var username = req.body[0]["username_POST"]
        var code = req.body[0]["code_purchase_request_POST"]
        var purchasing = req.body[0]["employeeID_POST"]
        let updatePurchaseRequestDelegationData = await model.log_purchase_request.update(
            {
                employee_purchasing: purchasing,
                status: 3
            },
            {
                where:
                {
                    code_purchase_request: code
                },
                transaction: transaction
            },
        );
        if (updatePurchaseRequestDelegationData) {
            updatePurchaseRequestDetail()
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function updatePurchaseRequestDetail() {
            var codeItemDetail = req.body[0]["detail"]
            for (const item of codeItemDetail) {
                var updatePurchaseRequestDetailData = await model.log_purchase_request_detail.update(
                    {
                        note: item.note_POST,
                        qty_request: item.qty_request_POST,
                        qty_actual: item.qty_actualt_POST,
                        status: 2
                    },
                    {
                        where:
                        {
                            [Op.and]:
                                [
                                    { code_purchase_request: code, },
                                    { code_item: item.code_item_POST },
                                ]
                        },
                        transaction: transaction
                    }
                )
            }
            if (updatePurchaseRequestDetailData) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: updatePurchaseRequestDetailData,
                });
                logger.info('Update Purchase Request Delegation', {
                    "1.username": `${username}`,
                    "2.module": 'updatePurchaseRequestDelegation',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback();
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
            });
        } else {
            await transaction.rollback();
            res.status(404).json({
                message: error.message,
            });
        }
    }
}
controller.updatePurchaseRequestItem = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body["language_POST"]
        var username = req.body["username_POST"]
        var code = req.body["code_POST"]
        let updatePurchaseRequestItemData = await model.log_purchase_request_detail.update(
            {
                status: 4,
            },
            {
                where:
                {
                    id: code
                },
                transaction: transaction
            },
        );
        if (updatePurchaseRequestItemData) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: updatePurchaseRequestItemData,
            });
            logger.info('Update Purchase Request Item (Delete)', {
                "1.username": `${username}`,
                "2.module": 'updatePurchaseRequestItem',
                "3.status": 'success',
                "4.action": req.body
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
        if (error.name === 'SequelizeUniqueConstraintError') {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
                data: [], // Tidak ada data yang disimpan karena duplikasi
            });
        } else {
            // Tangani error lain yang tidak terduga
            await transaction.rollback();
            res.status(404).json({
                message: error.message,
            });
        }
    }
}
controller.selectPurchaseRequestQuotationByCode = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        // var language = req.body.language_POST
        var code = req.body.code_purchase_request_POST
        let selectPurchaseRequestByCodeData = await model.log_purchase_request.findAll({
            include: [
                {
                    model: model.log_purchase_request_detail,
                    include: {
                        model: model.log_item_master
                    },
                    where: {
                        status: {
                            [Sequelize.Op.not]: 4
                        },
                    }
                },
                {
                    model: model.log_purchase_request_approval,
                    include: {
                        model: model.hrd_employee,
                        attributes: ["fullname"]
                    },
                },
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"]
                },
                {
                    model: model.hrd_employee,
                    as: "employeePurchasing",
                    attributes: ["fullname"]
                },
            ],
            where:
            {
                [Op.and]:
                    [
                        { code_purchase_request: code, },
                        {
                            status: {
                                [Sequelize.Op.not]: 6
                            },
                        }
                    ]
            },
            order: [
                [model.log_purchase_request_approval, 'level_approval', 'ASC']
            ],
            transaction: transaction,
        });
        if (selectPurchaseRequestByCodeData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectPurchaseRequestByCodeData,
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
        res.status(404).json({
            message: error,
        });
    }
}
controller.selectPurchaseRequestDelegationByCode = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        // var language = req.body.language_POST
        var code = req.body.code_purchase_request_POST
        let selectPurchaseRequestByCodeData = await model.log_purchase_request.findAll({
            include: [
                {
                    model: model.log_purchase_request_detail,
                    include: {
                        model: model.log_item_master
                    },
                    where: {
                        status: {
                            [Sequelize.Op.not]: 4
                        },
                    }
                },
                {
                    model: model.log_purchase_request_approval,
                    include: {
                        model: model.hrd_employee,
                        attributes: ["fullname"]
                    },
                },
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"]
                },
                {
                    model: model.hrd_employee,
                    as: "employeePurchasing",
                    attributes: ["fullname"]
                },
            ],
            where:
            {
                [Op.and]:
                    [
                        { code_purchase_request: code, },
                        {
                            status: {
                                [Sequelize.Op.not]: 6
                            },
                        }
                    ]
            },
            order: [
                [model.log_purchase_request_approval, 'level_approval', 'ASC']
            ],
            transaction: transaction,
        });
        if (selectPurchaseRequestByCodeData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectPurchaseRequestByCodeData,
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
        res.status(404).json({
            message: error,
        });
    }
}
controller.updatePurchaseRequestDone = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const username = req.body.username_POST
        const code = req.body.code_purchase_request_POST
        let deletePostingPurchaseRequestData = await model.log_purchase_request.update(
            {
                status: 4,
            },
            {
                where:
                {
                    code_purchase_request: code
                },
                transaction: transaction
            },
        );
        if (deletePostingPurchaseRequestData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.deleteData,
            });
            logger.info('Update Purchase Request Done', {
                "1.username": `${username}`,
                "2.module": 'updatePurchaseRequestDone',
                "3.status": 'success',
                "4.action": req.body
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
module.exports = controller;