const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")


controller.selectApprovalTransaction = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var employee = req.body.employeeID_POST
        let selectApprovalPurchaseRequestData = await model.log_purchase_request_approval.findAll({
            where:
            {
                [Op.and]:
                    [
                        { employee_id: employee, },
                        { date: null },
                        { status: 1 }
                    ]
            },
            transaction: transaction,
        });
        var data = {
            dataPurchaseRequest: selectApprovalPurchaseRequestData,
        }
        if (selectApprovalPurchaseRequestData.length > 0) {
            selectApprovalGoodsReceipt(data)
        } else {
            selectApprovalGoodsReceipt(data)
        }
        async function selectApprovalGoodsReceipt(data) {
            let selectApprovalGoodsReceiptData = await model.log_goods_receipt_approval.findAll({
                where:
                {
                    [Op.and]:
                        [
                            { employee_id: employee, },
                            { date: null },
                            { status: 1 }
                        ]
                },
                transaction: transaction,
            })
            var data = {
                dataPurchaseRequest: selectApprovalPurchaseRequestData,
                dataGoodsReceipt: selectApprovalGoodsReceiptData
            }
            if (selectApprovalGoodsReceiptData.length > 0) {
                selectApprovalGoodsIssue(data)
            } else {
                selectApprovalGoodsIssue(data)
            }
        }
        async function selectApprovalGoodsIssue(data) {
            let selectApprovalGoodsIssueData = await model.log_goods_issue_approval.findAll({
                where:
                {
                    [Op.and]:
                        [
                            { employee_id: employee, },
                            { date: null },
                            { status: 1 }
                        ]
                },
                transaction: transaction,
            })
            var data = {
                dataPurchaseRequest: data["dataPurchaseRequest"],
                dataGoodsReceipt: data["dataGoodsReceipt"],
                dataGoodsIssue: selectApprovalGoodsIssueData
            }
            if (selectApprovalGoodsIssueData.length > 0) {
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
                })
            }
        }
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}





module.exports = controller;