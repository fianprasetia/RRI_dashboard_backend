const model = require("../models/index")
const messages = require("./message")
const eppsLib = require('./epps');
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectGoodsReceipt = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var codeWarehouse = req.body.code_warehouse_POST
        var startDate = req.body.start_date_POST
        var endDate = req.body.end_date_POST
        var type = req.body.type_POST
        let selectGoodsReceiptData = await model.log_goods_receipt.findAll({
            include: [
                {
                    model: model.log_goods_receipt_detail,
                    include: {
                        model: model.log_item_master
                    },
                    as: "details"
                },
                {
                    model: model.log_purchase_order,
                    include: {
                        model: model.log_partners,
                        attributes: ["name"]

                    }
                },
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"],
                    as: "employeeWarehouse"
                },
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
                [Op.and]: [
                    { warehouse: codeWarehouse },
                    {
                        date: {
                            [Op.between]: [startDate, endDate]
                        },
                    },
                    { type: type },
                    {
                        status: {
                            [Sequelize.Op.not]: 4
                        },
                    }
                ]
            },
            transaction: transaction,
            order: [
                ['code_goods_receipt', 'DESC'],
            ],
        });
        if (selectGoodsReceiptData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectGoodsReceiptData,
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
controller.selectGoodsReceiptByCode = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var code = req.body.code_goods_receipt_POST
        let selectGoodsReceiptByCodeData = await model.log_goods_receipt.findAll({
            include:
                [
                    {
                        model: model.log_goods_receipt_detail,
                        include:
                        {
                            model: model.log_item_master
                        },
                        as: "details",
                        order: [
                            ['code_item', 'ASC']
                        ],
                    },
                    {
                        model: model.log_purchase_order,
                        include:
                            [
                                // {
                                //     model: model.log_purchase_order_detail,
                                //     as: "details",
                                //     order: [
                                //         ['code_item', 'ASC']
                                //     ],
                                // },
                                {
                                    model: model.log_partners,
                                    attributes: ["name"]

                                },
                            ]
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                        as: "employeeWarehouse"
                    },
                    {
                        model: model.adm_signature,
                        as: "employeeSignature"
                    },
                    {
                        model: model.log_goods_receipt_approval,
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
                        { code_goods_receipt: code, },
                        {
                            status: {
                                [Sequelize.Op.not]: 3
                            },
                        }
                    ]
            },
            order: [
                [model.log_goods_receipt_approval, 'level_approval', 'ASC']
            ],
            transaction: transaction,
        });
        if (selectGoodsReceiptByCodeData.length > 0) {

            selectPurchaseOrderDetail(selectGoodsReceiptByCodeData)
        } else {
            await transaction.rollback()
             res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectPurchaseOrderDetail(selectGoodsReceiptByCodeData) {
            let codePO = selectGoodsReceiptByCodeData[0]["code_purchase_order"]
            var arrCodeItem = [];
            for (var i = 0; i < selectGoodsReceiptByCodeData[0]["details"].length; i++)
                arrCodeItem.push(selectGoodsReceiptByCodeData[0]["details"][i]["code_item"]);
            var selectPurchaseOrderDetailData = await model.log_purchase_order_detail.findAll({
                where:
                {
                    [Op.and]: [
                        { code_purchase_order: codePO },
                        { code_item: arrCodeItem },
                    ]
                },
                transaction: transaction
            });
            var data = {
                dataPODetail: selectPurchaseOrderDetailData,
                dataGR: selectGoodsReceiptByCodeData
            }
            if (selectPurchaseOrderDetailData.length > 0) {
                // await transaction.commit()
                // res.status(200).json({
                //     access: "success",
                //     data: data,
                // });
                selectSignature(data)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    message: " Tidak ada data",
                    data: [],
                });
            }
        }
        async function selectSignature(data) {
            var employeeWareHouse = data["dataGR"][0]["employee_id"]
            var jmlData = data["dataGR"][0]["log_goods_receipt_approvals"].length;
            let arrIdSignature = [];
            // arrIdSignature.push(employeeWareHouse);
            for (var i = 0; i < jmlData; i++) { // Tidak perlu .length di sini
                arrIdSignature.push(data["dataGR"][0]["log_goods_receipt_approvals"][i]["employee_id"]);
            }

            let selectSignatureData = await model.adm_signature.findAll({
                where:
                {
                    employee_id: arrIdSignature
                },
            });
            var data = {
                dataPODetail: data["dataPODetail"],
                dataGR: data["dataGR"],
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
controller.insertGoodsReceipt = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body[0]["language_POST"]
        const username = req.body[0]["username_POST"]
        var codePurchaseOrder = req.body[0]["purchase_order_POST"]
        var date = req.body[0]["date_POST"]
        var employeeCode = req.body[0]["employeeID_POST"]
        var codeCompany = req.body[0]["company_code_POST"]
        var codeWarehouse = req.body[0]["code_warehouse_POST"]
        var invoice = req.body[0]["invoice_POST"]
        var shipping = req.body[0]["shipping_POST"]
        var type = req.body[0]["type_POST"]
        const yearAndMonth = date.split("-").slice(0, 2).join("-");
        const formattedDate = date.split("-").slice(0, 2).join("");
        var arrIdItem = [];
        for (var i = 0; i < req.body[0]["detail"].length; i++)
            arrIdItem.push(req.body[0]["detail"][i]["code_item_POST"]);
        var selectPurchaseOrderData = await model.log_purchase_order.findAll({
            include: [
                {
                    model: model.log_purchase_order_detail,
                    where: {
                        [Op.and]: [
                            { code_item: arrIdItem },
                        ],
                    },
                    as: "details",
                },
            ],
            where:
            {
                code_purchase_order: codePurchaseOrder
            },
            transaction: transaction
        }
        );
        var data = {
            dataSubtotal: selectPurchaseOrderData[0]["subtotal"],
            dataDiscount: selectPurchaseOrderData[0]["discount"],
            dataItem: selectPurchaseOrderData[0]["details"]
        }
        if (selectPurchaseOrderData.length > 0) {
            selectGoodsReceip(data)
        } else {
            await transaction.rollback()
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
            });
        }
        async function selectGoodsReceip(data) {
            var selectGoodsReceiptData = await model.log_goods_receipt.findAll({
                where:
                {
                    [Op.and]: [
                        { warehouse: codeWarehouse },
                        Sequelize.where(
                            Sequelize.fn('to_char', Sequelize.col('date'), 'YYYY-MM'), // Format tanggal menjadi 'YYYY-MM'
                            yearAndMonth // '2024-12'
                        )
                    ]
                },
                transaction: transaction
            }
            );
            if (selectGoodsReceiptData.length > 0) {
                var idsubstring = []
                var idsubstringPush = []
                var idsubstringMax
                for (var i = 0; i < selectGoodsReceiptData.length; i++) {
                    idsubstring = selectGoodsReceiptData[i]['code_goods_receipt'].split("/")[0];
                    idsubstringPush.push(idsubstring);
                    idsubstringMax = Math.max.apply(null, idsubstringPush)
                }
                var endsubstringCodeInt = parseInt(idsubstringMax) + 1
                let noUrut = (endsubstringCodeInt.toString()).padStart(3, "0")
                newCode = noUrut + "/GR/" + codeCompany + "/" + codeWarehouse + "/" + formattedDate
                insertGoodsReceipt(newCode, data)
            } else {
                no = "1"
                let noUrut = no.padStart(3, "0")
                newCode = noUrut + "/GR/" + codeCompany + "/" + codeWarehouse + "/" + formattedDate
                insertGoodsReceipt(newCode, data)
            }
        }
        async function insertGoodsReceipt(newCode, data) {
            var insertGoodsReceiptData = await model.log_goods_receipt.create(
                {
                    code_goods_receipt: newCode,
                    code_company: codeCompany,
                    warehouse: codeWarehouse,
                    employee_id: employeeCode,
                    code_purchase_order: codePurchaseOrder,
                    date: date,
                    invoice: invoice,
                    shipping: shipping,
                    type: type,
                    status: 0,
                },
                {
                    transaction: transaction
                }
            );
            if (insertGoodsReceiptData) {
                insertGoodsReceiptDetail(newCode, data)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }
        }
        async function insertGoodsReceiptDetail(newCode, data) {
            let subtotal = data["dataSubtotal"]
            let discount = data["dataDiscount"]
            let TotalAfterDiscount = parseFloat(subtotal) - parseFloat(discount)
            var priceDiscountDetail = []
            for (var i = 0; i < data["dataItem"].length; i++) {
                price = data["dataItem"][i]["price"]
                qty = data["dataItem"][i]["qty"]
                priceDiscount = (((parseFloat(qty) * parseFloat(price)) / parseFloat(subtotal)) * parseFloat(TotalAfterDiscount)) / parseFloat(qty)
                extend(priceDiscount, price);
                priceDiscountDetail.push(priceDiscount);
            }
            jmlData = req.body[0]["detail"]
            var dataGoodsReceiptDetail = []
            for (var i = 0; i < jmlData.length; i++) {
                let price = parseFloat(data["dataItem"][i]["price"]); // Harga asli
                let discountedPrice = priceDiscountDetail[i];
                let newCodeDetail = JSON.parse('{"code_goods_receipt": "' + newCode + '"}')
                let codeItemDetail = JSON.parse('{"code_item": "' + req.body[0]["detail"][i].code_item_POST + '"}')
                let qtyDetail = JSON.parse('{"qty": ' + req.body[0]["detail"][i].qty_received_POST + '}')
                let originalPriceDetail = JSON.parse('{"original_price":' + price + ' }')
                let discountedPriceDetail = JSON.parse('{"discounted_price": ' + eppsLib.customRound(discountedPrice) + '}')
                let statusDetail = JSON.parse('{"status": 0}')
                extend(newCodeDetail, codeItemDetail, qtyDetail, originalPriceDetail, discountedPriceDetail, statusDetail);
                dataGoodsReceiptDetail.push(newCodeDetail);
            }
            var insertGoodsReceiptDetailData = await model.log_goods_receipt_detail.bulkCreate(
                dataGoodsReceiptDetail,
                {
                    transaction: transaction
                }
            );
            if (insertGoodsReceiptDetailData) {
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
                        { code_company: codeWarehouse },
                        { type_approval: "GR" }
                    ]
                },
                transaction: transaction,
                order: [
                    ['level_approval', 'ASC'],
                ],

            });

            if (selectUserApprovalData.length > 0) {
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
                newCodeApproval = JSON.parse('{"code_goods_receipt": "' + newCode + '"}')
                employeeApproval = JSON.parse('{"employee_id": "' + selectUserApprovalData[i].employee_id + '"}')
                dateApproval = JSON.parse('{"date": null}')
                noteApproval = JSON.parse('{"note": ""}')
                levelApproval = JSON.parse('{"level_approval": ' + selectUserApprovalData[i].level_approval + '}')
                statusDetail = JSON.parse('{"status": 0}')
                extend(newCodeApproval, employeeApproval, dateApproval, noteApproval, levelApproval, statusDetail);
                dataUserApproval.push(newCodeApproval);
            }

            var insertUserApprovalData = await model.log_goods_receipt_approval.bulkCreate(
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
                logger.info('Insert Goods Receipt', {
                    "1.username": `${username}`,
                    "2.module": 'insertGoodsReceipt',
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
                data: [],
            });
        } else {
            await transaction.rollback();
            res.status(404).json({
                message: error.message,
            });
        }
    }
}
controller.updateGoodsReceipt = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body[0]["language_POST"]
        const username = req.body[0]["username_POST"]
        var codeGoodsReceipt = req.body[0]["goods_receipt_POST"]
        var codePurchaseOrder = req.body[0]["purchase_order_POST"]
        var date = req.body[0]["date_POST"]
        var employeeCode = req.body[0]["employeeID_POST"]
        var codeCompany = req.body[0]["company_code_POST"]
        var codeWarehouse = req.body[0]["code_warehouse_POST"]
        var invoice = req.body[0]["invoice_POST"]
        var shipping = req.body[0]["shipping_POST"]
        var type = req.body[0]["type_POST"]
        let updateGoodsReceiptData = await model.log_goods_receipt.update(
            {
                date: date,
                invoice: invoice,
                shipping: shipping,
            },
            {
                where:
                {
                    code_goods_receipt: codeGoodsReceipt
                },
                transaction: transaction
            },
        );
        if (updateGoodsReceiptData) {
            selectPurchaseOrder()
        } else {
            await transaction.rollback()
             res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectPurchaseOrder() {
            var arrIdItem = [];
            for (var i = 0; i < req.body[0]["detail"].length; i++)
                arrIdItem.push(req.body[0]["detail"][i]["code_item_POST"]);
            var selectPurchaseOrderData = await model.log_purchase_order.findAll({
                include: [
                    {
                        model: model.log_purchase_order_detail,
                        // include: {
                        //     model: model.log_item_master,
                        // },
                        where: {
                            [Op.and]: [
                                { code_item: arrIdItem },
                            ],
                        },
                        as: "details",
                    },
                ],
                where:
                {
                    code_purchase_order: codePurchaseOrder
                },
                transaction: transaction
            }
            );
            var data = {
                dataSubtotal: selectPurchaseOrderData[0]["subtotal"],
                dataDiscount: selectPurchaseOrderData[0]["discount"],
                dataItem: selectPurchaseOrderData[0]["details"]
            }
            if (selectPurchaseOrderData.length > 0) {
                deleteGoodsReceiptDetail(data)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }
        }
        async function deleteGoodsReceiptDetail(data) {
            let deleteGoodsReceiptDetailData = await model.log_goods_receipt_detail.destroy({
                where: {
                    code_goods_receipt: codeGoodsReceipt
                },
                transaction: transaction
            });
            if (deleteGoodsReceiptDetailData) {
                insertGoodsReceiptDetail(data)
            } else {
                await transaction.rollback();
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
        async function insertGoodsReceiptDetail(data) {
            let subtotal = data["dataSubtotal"]
            let discount = data["dataDiscount"]
            let TotalAfterDiscount = parseFloat(subtotal) - parseFloat(discount)
            var priceDiscountDetail = []
            for (var i = 0; i < data["dataItem"].length; i++) {
                price = data["dataItem"][i]["price"]
                qty = data["dataItem"][i]["qty"]
                priceDiscount = (((parseFloat(qty) * parseFloat(price)) / parseFloat(subtotal)) * parseFloat(TotalAfterDiscount)) / parseFloat(qty)
                extend(priceDiscount, price);
                priceDiscountDetail.push(priceDiscount);
            }
            jmlData = req.body[0]["detail"]
            var dataGoodsReceiptDetail = []
            for (var i = 0; i < jmlData.length; i++) {
                let price = parseFloat(data["dataItem"][i]["price"]); // Harga asli
                let discountedPrice = priceDiscountDetail[i];
                let newCodeDetail = JSON.parse('{"code_goods_receipt": "' + codeGoodsReceipt + '"}')
                let codeItemDetail = JSON.parse('{"code_item": "' + req.body[0]["detail"][i].code_item_POST + '"}')
                let qtyDetail = JSON.parse('{"qty": ' + req.body[0]["detail"][i].qty_received_POST + '}')
                let originalPriceDetail = JSON.parse('{"original_price":' + price + ' }')
                let discountedPriceDetail = JSON.parse('{"discounted_price": ' + eppsLib.customRound(discountedPrice) + '}')
                let statusDetail = JSON.parse('{"status": 0}')
                extend(newCodeDetail, codeItemDetail, qtyDetail, originalPriceDetail, discountedPriceDetail, statusDetail);
                dataGoodsReceiptDetail.push(newCodeDetail);
            }
            var insertGoodsReceiptDetailData = await model.log_goods_receipt_detail.bulkCreate(
                dataGoodsReceiptDetail,
                {
                    transaction: transaction
                }
            );
            if (insertGoodsReceiptDetailData) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: insertGoodsReceiptDetailData,
                });
                logger.info('Update Goods Receipt', {
                    "1.username": `${username}`,
                    "2.module": 'updateGoodsReceipt',
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
        await transaction.rollback()
        res.status(404).json({
            message: error,
        });
    }
}
controller.updatePostingGoodsReceipt = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const code = req.body.goods_receipt_POST
        const username = req.body.username_POST
        let updatePostingGoodsReceiptData = await model.log_goods_receipt.update(
            {
                status: 1,
            },
            {
                where:
                {
                    code_goods_receipt: code
                },
                transaction: transaction
            },
        );
        if (updatePostingGoodsReceiptData) {
            await updatePostingGoodsReceiptDetail()
        } else {
            await transaction.rollback()
            return res.status(200).json({
                message: " Tidak ada data",
                data: [],
            });
        }
        async function updatePostingGoodsReceiptDetail() {
            let updatePostingGoodsReceiptDetailData = await model.log_goods_receipt_detail.update(
                {
                    status: 1,
                },
                {
                    where: {
                        code_goods_receipt: code
                    },
                    transaction: transaction
                }
            )
            if (updatePostingGoodsReceiptDetailData) {
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
            let selectUserApprovalData = await model.log_goods_receipt_approval.findAll({
                where: {
                    code_goods_receipt: code
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
            let updateUserApprovalData = await model.log_goods_receipt_approval.update(
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
                                    code_goods_receipt: code
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
                logger.info('Update Posting Goods Receipt', {
                    "1.username": `${username}`,
                    "2.module": 'updatePostingGoodsReceipt',
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
controller.deleteGoodsReceipt = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const code = req.body.code_goods_receipt_POST
        var username = req.body.username_POST
        let deletePostingGoodsReceiptData = await model.log_goods_receipt.update(
            {
                status: 4,
            },
            {
                where:
                {
                    code_goods_receipt: code
                },
                transaction: transaction
            },
        );
        if (deletePostingGoodsReceiptData) {
            deletePurchaseRequestDetail()
        } else {
            await transaction.rollback()
             res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function deletePurchaseRequestDetail() {
            let deletePostingGoodsReceiptDetailData = await model.log_goods_receipt_detail.update(
                {
                    status: 4,
                },
                {
                    where: {
                        code_goods_receipt: code
                    },
                    transaction: transaction
                }
            )
            if (deletePostingGoodsReceiptDetailData) {
                deletePostingGoodsReceipApproval()
            } else {
                await transaction.rollback();
                return res.status(200).json({
                    access: "failed",
                    message: messages[language]?.nodata,
                });
            }
        }
        async function deletePostingGoodsReceipApproval() {
            let deletePostingGoodsReceipApprovalData = await model.log_goods_receipt_approval.update(
                {
                    status: 4,
                },
                {
                    where: {
                        code_goods_receipt: code
                    },
                    transaction: transaction
                }
            )
            if (deletePostingGoodsReceipApprovalData) {
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