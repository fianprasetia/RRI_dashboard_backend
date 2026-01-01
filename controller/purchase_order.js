const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectPurchaseOrder = async function (req, res) {
    try {
        const language = req.body.language_POST
        const employee = req.body.employeeID_POST
        start = req.body.start_date_POST
        end = req.body.end_date_POST + "T23:59:59";
        const startDate = new Date(start);
        const endDate = new Date(end);
        let selectPostingData = await model.adm_posting.findAll({
            where:
            {
                [Op.and]: [{ employee_id: employee }, { type_posting: "PO" }, { status: 0 }]
            },
        }
        );
        posting = selectPostingData.length
        if (selectPostingData.length > 0) {
            selectPurchaseOrder(posting)
        } else {
            selectPurchaseOrder(posting)
        }
        async function selectPurchaseOrder(posting) {
            let selectPurchaseOrderData = await model.log_purchase_order.findAll({
                include: [
                    {
                        model: model.log_purchase_order_detail,
                        include: {
                            model: model.log_item_master
                        },
                        as: "details"
                    },
                    {
                        model: model.adm_company,
                        attributes: ["name"]
                    },
                    {
                        model: model.adm_company,
                        attributes: ["name"],
                        as: "worksiteCompany"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                        as: "employeePurchasing"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                        as: "employeeApproval"
                    },
                    {
                        model: model.log_term_of_payment,
                        attributes: ["code_term_of_payment"],
                        include: {
                            model: model.log_term_of_payment_translations,
                            attributes: ["translation"],
                            where:
                            {
                            },
                        }
                    },
                    {
                        model: model.log_partners,
                    },
                ],
                where:
                {
                    [Op.and]:
                        [
                            {
                                createdAt: {
                                    [Op.between]: [startDate, endDate]
                                },
                            },
                            {
                                status: {
                                    [Op.notIn]: [5, 6]
                                },
                            }
                        ]
                },
                order: [
                    ['date_create', 'DESC'],
                    ['code_purchase_order', 'DESC'],
                ],
            });
            var data = {
                dataPosting: posting,
                dataPurchaseOrder: selectPurchaseOrderData
            }
            if (selectPurchaseOrderData.length > 0) {
                res.status(200).json({
                    access: "success",
                    data: data
                });
            } else {
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}
controller.selectPurchaseOrdertByCode = async function (req, res) {
    try {
        var code = req.body.code_purchase_order_POST
        let selectPurchaseOrdertByCodeData = await model.log_purchase_order.findAll({
            include: [
                {
                    model: model.log_purchase_order_detail,
                    include: {
                        model: model.log_item_master
                    },
                    as: "details"
                },
                {
                    model: model.adm_company,
                    attributes: ["name"]
                },
                {
                    model: model.adm_company,
                    attributes: ["name"],
                    as: "worksiteCompany"
                },
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"],
                    as: "employeePurchasing"
                },
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"],
                    as: "employeeApproval"
                },
                {
                    model: model.log_receiving_locations,
                },
                {
                    model: model.log_term_of_payment,
                    attributes: ["code_term_of_payment"],
                    include: {
                        model: model.log_term_of_payment_translations,
                        attributes: ["translation"],
                        where:
                        {
                        },
                    }
                },
                {
                    model: model.log_partners,
                },
            ],
            where:
            {
                [Op.and]:
                    [
                        { code_purchase_order: code, },
                        {
                            status: {
                                [Sequelize.Op.not]: 6
                            },
                        }
                    ]
            },
        });
        if (selectPurchaseOrdertByCodeData.length > 0) {
            selectSignature(selectPurchaseOrdertByCodeData)
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectSignature(selectPurchaseOrdertByCodeData) {
            var employee = selectPurchaseOrdertByCodeData[0]["employee_approval"]
            let selectSignatureData = await model.adm_signature.findAll({
                where:
                {
                    employee_id: employee
                },
            });
            var data = {
                dataPO: selectPurchaseOrdertByCodeData,
                dataSignature: selectSignatureData
            }
            if (selectSignatureData.length > 0) {
                res.status(200).json({
                    access: "success",
                    data: data,
                });
            } else {
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
controller.updatePostingPurchaseOrder = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const username = req.body.username_POST
        const code = req.body.code_purchase_order_POST
        const employee = req.body.employeeID_POST
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
        const year = date.getFullYear();
        const formattedDate = `${year}-${month}-${day}`;
        let selectSignatureData = await model.adm_signature.findAll({
            where:
            {
                employee_id: employee
            },
        });
        if (selectSignatureData.length > 0) {
            updatePostingPurchaseOrder()
        } else {
            res.status(200).json({
                access: "failed",
                data: [],
            });
        }
        async function updatePostingPurchaseOrder() {
            let updatePostingPurchaseOrderData = await model.log_purchase_order.update(
                {
                    status: 1,
                    employee_approval: employee,
                    date_release: formattedDate
                },
                {
                    where:
                    {
                        code_purchase_order: code
                    },
                    transaction: transaction
                },
            );
            if (updatePostingPurchaseOrderData) {
                await updatePostingPurchaseOrderDetail()
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.postingCorrect,
                    data: [],
                });
            }
        }
        async function updatePostingPurchaseOrderDetail() {
            let updatePostingPurchaseOrderDetailData = await model.log_purchase_order_detail.update(
                {
                    status: 1,
                },
                {
                    where: {
                        code_purchase_order: code
                    },
                    transaction: transaction
                }
            )
            if (updatePostingPurchaseOrderDetailData.length > 0) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.postingData,
                    data: updatePostingPurchaseOrderDetailData,
                });
                logger.info('Update Posting Purchase Order', {
                    "1.username": `${username}`,
                    "2.module": 'updatePostingPurchaseOrder',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback();
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.postingCorrect,
                    data: [],
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
controller.deletePurchaseOrder = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const username = req.body.username_POST
        const code = req.body.code_purchase_order_POST
        let deletePurchaseOrderData = await model.log_purchase_order.update(
            {
                status: 6,
            },
            {
                where:
                {
                    code_purchase_order: code
                },
                transaction: transaction
            },
        );
        if (deletePurchaseOrderData) {
            await deletePurchaseOrderDetail()
        } else {
            await transaction.rollback()
            return res.status(200).json({
                message: " Tidak ada data",
                data: [],
            });
        }

        async function deletePurchaseOrderDetail() {
            let deletePurchaseOrderDetailData = await model.log_purchase_order_detail.update(
                {
                    status: 2,
                },
                {
                    where: {
                        code_purchase_order: code
                    },
                    transaction: transaction
                }
            )
            if (deletePurchaseOrderDetailData.length > 0) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    data: deletePurchaseOrderDetailData,
                });
                logger.info('Delete Purchase Order', {
                    "1.username": `${username}`,
                    "2.module": 'deletePurchaseOrder',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback();
                es.status(200).json({
                    access: "failed",
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
controller.selectPurchaseOrderGoodReceipt = async function (req, res) {
    try {
        const language = req.body.language_POST
        const worksite = req.body.worksite_POST
        const type = req.body.type_POST
        if (type == "WH") {
            var typeGR = Sequelize.literal(`CAST("code_item" AS TEXT) NOT LIKE '9%'`)
        } if (type == "AS") {
            var typeGR = Sequelize.literal(`CAST("code_item" AS TEXT) LIKE '9%'`)
        }
        let selectPurchaseOrderData = await model.log_purchase_order.findAll({
            include: [
                {
                    model: model.log_purchase_order_detail,
                    include: {
                        model: model.log_item_master
                    },
                    where:
                    {
                        [Op.and]:
                            [
                                typeGR,
                                { status: 1 }
                            ]
                    },
                    as: "details"
                },
                {
                    model: model.adm_company,
                    attributes: ["name"]
                },
                {
                    model: model.adm_company,
                    attributes: ["name"],
                    as: "worksiteCompany"
                },
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"],
                    as: "employeePurchasing"
                },
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"],
                    as: "employeeApproval"
                },
                {
                    model: model.log_term_of_payment,
                    attributes: ["code_term_of_payment"],
                    include: {
                        model: model.log_term_of_payment_translations,
                        attributes: ["translation"],
                        where:
                        {
                        },
                    }
                },
                {
                    model: model.log_partners,
                },
            ],
            where:
            {
                [Op.and]:
                    [
                        { worksite: worksite },
                        { status: 1 }
                    ]
            },
            order: [
                ['date_create', 'DESC'],
                ['code_purchase_order', 'DESC'],
            ],
        });
        if (selectPurchaseOrderData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectPurchaseOrderData
            });
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
            });
        }
        async function selectWarehouse(selectPurchaseOrderData) {
            let selectWarehouseData = await model.adm_company.findAll({
                where:
                {
                    [Op.and]: [{ parent_code: worksite }, { code_company_type: "Warehouse" }]
                },
            });
            var data = {
                dataWarehouse: selectWarehouseData,
                dataPurchaseOrder: selectPurchaseOrderData
            }
            if (selectWarehouseData.length > 0) {
                res.status(200).json({
                    access: "success",
                    data: data
                });
            } else {
                res.status(200).json({
                    access: "failed",
                    data: [],
                });
            }
        }
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}
controller.selectPurchaseOrderGoodReceiptByCode = async function (req, res) {
    try {
        var code = req.body.code_purchase_order_POST
        const type = req.body.type_POST
        if (type == "WH") {
            var typeGR = Sequelize.literal(`CAST("code_item" AS TEXT) NOT LIKE '9%'`)
        } if (type == "AS") {
            var typeGR = Sequelize.literal(`CAST("code_item" AS TEXT) LIKE '9%'`)
        }
        let selectPurchaseOrdertByCodeData = await model.log_purchase_order.findAll({
            include: [
                {
                    model: model.log_purchase_order_detail,
                    include: {
                        model: model.log_item_master
                    },
                    where:
                    {
                        [Op.and]:
                            [
                                typeGR,
                                { status: 1 }
                            ]
                    },
                    as: "details"
                },
                // {
                //     model: model.adm_company,
                //     attributes: ["name"]
                // },
                {
                    model: model.adm_company,
                    attributes: ["name"],
                    as: "worksiteCompany"
                },
                // {
                //     model: model.hrd_employee,
                //     attributes: ["fullname"],
                //     as: "employeePurchasing"
                // },
                // {
                //     model: model.hrd_employee,
                //     attributes: ["fullname"],
                //     as: "employeeApproval"
                // },
                // {
                //     model: model.log_receiving_locations,
                // },
                // {
                //     model: model.log_term_of_payment,
                //     attributes: ["code_term_of_payment"],
                //     include: {
                //         model: model.log_term_of_payment_translations,
                //         attributes: ["translation"],
                //         where:
                //         {
                //         },
                //     }
                // },
                {
                    model: model.log_partners,
                },
            ],
            where:
            {
                [Op.and]:
                    [
                        { code_purchase_order: code, },
                    ]
            },
        });
        if (selectPurchaseOrdertByCodeData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectPurchaseOrdertByCodeData,
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
controller.selectPurchaseOrderDownPayment = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            worksite_POST: worksite,
            code_POST: code,
        } = requestData;

        const selectPurchasOrderData = await selectPurchasOrder();
        if (selectPurchasOrderData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectPurchasOrderData);

        async function selectPurchasOrder() {
            return await model.log_purchase_order.findAll({
                include: [
                    {
                        model: model.log_purchase_order_detail,
                        include: {
                            model: model.log_item_master
                        },
                        as: "details"
                    },
                    {
                        model: model.adm_company,
                        attributes: ["name"]
                    },
                    {
                        model: model.adm_company,
                        attributes: ["name"],
                        as: "worksiteCompany"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                        as: "employeePurchasing"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                        as: "employeeApproval"
                    },
                    {
                        model: model.log_term_of_payment,
                        attributes: ["code_term_of_payment"],
                        include: {
                            model: model.log_term_of_payment_translations,
                            attributes: ["translation"],
                            where:
                            {
                            },
                        }
                    },
                    {
                        model: model.log_partners,
                    },
                ],
                where:
                {
                    [Op.and]:
                        [
                            {
                                code_purchase_order:
                                {
                                    [Op.like]: '%' + code + '%'
                                }
                            },
                            {
                                status: 1
                            },
                            {
                                worksite
                            },
                        ]
                },
            });
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

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
}
controller.selectPurchaseOrderPayment = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            worksite_POST: worksite,
            code_POST: code,
        } = requestData;

        const selectPurchasOrderData = await selectPurchasOrder();
        if (selectPurchasOrderData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }
        const selectPaymentVoucherData = await selectPaymentVoucher(selectPurchasOrderData)
        data = {
            dataPurchaseOrder: selectPurchasOrderData,
            dataPaymentVoucher: selectPaymentVoucherData,
        }
        const dataPayment = await combinePurchaseOrderWithPayments(data)
        sendSuccessResponse(messages[language]?.successfulData, dataPayment);

        async function selectPurchasOrder() {
            return await model.log_purchase_order.findAll({
                // include: [
                //     {
                //         model: model.log_purchase_order_detail,
                //         include: {
                //             model: model.log_item_master
                //         },
                //         as: "details"
                //     },
                //     {
                //         model: model.adm_company,
                //         attributes: ["name"]
                //     },
                //     {
                //         model: model.adm_company,
                //         attributes: ["name"],
                //         as: "worksiteCompany"
                //     },
                //     {
                //         model: model.hrd_employee,
                //         attributes: ["fullname"],
                //         as: "employeePurchasing"
                //     },
                //     {
                //         model: model.hrd_employee,
                //         attributes: ["fullname"],
                //         as: "employeeApproval"
                //     },
                //     {
                //         model: model.log_term_of_payment,
                //         attributes: ["code_term_of_payment"],
                //         include: {
                //             model: model.log_term_of_payment_translations,
                //             attributes: ["translation"],
                //             where:
                //             {
                //             },
                //         }
                //     },
                //     {
                //         model: model.log_partners,
                //     },
                // ],
                attributes: ["code_purchase_order", "subtotal", "vat", "grand_total"],
                where:
                {
                    [Op.and]:
                        [
                            {
                                code_purchase_order:
                                {
                                    [Op.like]: '%' + code + '%'
                                }
                            },
                            {
                                status: 2
                            },
                            {
                                worksite
                            },
                        ]
                },
            });
        }
        async function selectPaymentVoucher(selectPurchasOrderData) {
            var codePurchaseOrder = [];
            for (var i = 0; i < selectPurchasOrderData.length; i++)
                codePurchaseOrder.push(selectPurchasOrderData[0]["code_purchase_order"]);
            return await model.fat_payment_voucher.findAll({
                include: [
                    {
                        model: model.fat_payment_voucher_detail,
                        as: "details"
                    },
                    // {
                    //     model: model.adm_company,
                    //     attributes: ["code_company", "name"],
                    // },
                    // {
                    //     model: model.hrd_employee,
                    //     attributes: ["employee_id", "fullname"],
                    //     as: "employeeCreate"
                    // },
                    // {
                    //     model: model.hrd_employee,
                    //     attributes: ["employee_id", "fullname"],
                    //     as: "employeeUpdate"
                    // },
                    // {
                    //     model: model.log_partners,
                    //     attributes: ["code_partners", "name"],
                    //     include: [
                    //         {
                    //             model: model.log_partners_type
                    //         }
                    //     ]
                    // },
                ],
                where: {
                    [Op.and]:
                        [
                            {
                                no_transaction: codePurchaseOrder
                            },
                            {
                                status: 2
                            },
                        ]
                },
            });
        }
        async function combinePurchaseOrderWithPayments(data) {
            try {
                // Kelompokkan payment voucher berdasarkan no_transaction (code_purchase_order)
                const paymentGroups = {};

                data.dataPaymentVoucher.forEach(pv => {
                    if (!paymentGroups[pv.no_transaction]) {
                        paymentGroups[pv.no_transaction] = [];
                    }
                    paymentGroups[pv.no_transaction].push(pv);
                });

                // Proses setiap purchase order
                const result = data.dataPurchaseOrder.map(po => {
                    const payments = paymentGroups[po.code_purchase_order] || [];

                    const output = {
                        code_purchase_order: po.code_purchase_order,
                        subtotal: po.subtotal,
                        vat: po.vat,
                        grand_total: po.grand_total
                    };

                    // Hitung DP dan payment lainnya
                    let dpAmount = 0;
                    const regularPayments = [];

                    payments.forEach(pv => {
                        const totalAmount = pv.details.reduce((sum, detail) => sum + detail.amount, 0);

                        if (pv.code_payment_voucher_type === "DP") {
                            dpAmount += totalAmount;
                        } else {
                            regularPayments.push(totalAmount);
                        }
                    });

                    // Tambahkan DP jika ada
                    if (dpAmount > 0) {
                        output.DP = dpAmount;
                    }

                    // Tambahkan payment_1, payment_2, dst.
                    regularPayments.forEach((amount, index) => {
                        output[`payment_${index + 1}`] = amount;
                    });

                    return output;
                });

                return result;
            } catch (error) {
                console.error("Error in combinePurchaseOrderWithPayments:", error);
                throw error;
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

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
}
controller.updateReturnPurchaseOrder = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            username_POST: username,
            code_purchase_order_POST: code,
        } = requestData;


        const deletePurchaseOrderData = await deletePurchaseOrder();
        if (!deletePurchaseOrderData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        const deletePurchaseOrderDetailDaa = await deletePurchaseOrderDetail();
        if (!deletePurchaseOrderDetailDaa) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        const selectPurchaseOrderData = await selectPurchaseOrder()
        if (selectPurchaseOrderData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }
        const updatePurchaseRequestQuotationData = await updatePurchaseRequestQuotation(selectPurchaseOrderData);
        if (!updatePurchaseRequestQuotationData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        const updatePostingPurchaseRequestQuotationDetailData = await updatePostingPurchaseRequestQuotationDetail(selectPurchaseOrderData)
        if (!updatePostingPurchaseRequestQuotationDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const updatePurchaseRequestDetailQtyRFQData = await updatePurchaseRequestDetailQtyRFQ(selectPurchaseOrderData)
        if (!updatePurchaseRequestDetailQtyRFQData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const updatePurchaseRequestData = await updatePurchaseRequest(selectPurchaseOrderData)
        if (!updatePurchaseRequestData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData);
        logAction('success');

        async function deletePurchaseOrder() {
            return await model.log_purchase_order.update(
                {
                    status: 6,
                },
                {
                    where:
                    {
                        code_purchase_order: code
                    },
                    transaction
                },
            );
        }
        async function deletePurchaseOrderDetail() {
            return await model.log_purchase_order_detail.update(
                {
                    status: 2,
                },
                {
                    where: {
                        code_purchase_order: code
                    },
                    transaction
                }
            )
        }
        async function selectPurchaseOrder() {
            return await model.log_purchase_order.findOne({
                include: [
                    {
                        model: model.log_purchase_order_detail,
                        as: "details"
                    },
                ],
                where: {
                    code_purchase_order: code
                },
            });
        }
        async function updatePurchaseRequestQuotation(selectPurchaseOrderData) {
            const codeRfq = selectPurchaseOrderData["code_purchase_request_quotation"]
            return await model.log_purchase_request_quotation.update(
                {
                    status: 0
                },
                {
                    where:
                    {
                        code_purchase_request_quotation: codeRfq
                    },
                    transaction,
                },
            );
        }
        async function updatePostingPurchaseRequestQuotationDetail(selectPurchaseOrderData) {
            const codeRfq = selectPurchaseOrderData["code_purchase_request_quotation"]
            return await model.log_purchase_request_quotation_detail.update(
                {
                    status: 0,
                },
                {
                    where: {
                        code_purchase_request_quotation: codeRfq
                    },
                    transaction
                }
            )
        }
        async function updatePurchaseRequestDetailQtyRFQ(selectPurchaseOrderData) {
            const codePR = selectPurchaseOrderData.code_purchase_request;
            const codeItemDetail = selectPurchaseOrderData.details;
            for (const item of codeItemDetail) {
                await model.log_purchase_request_detail.update(
                    {
                        qty_rfq: Sequelize.literal(`qty_rfq - ${item.qty}`),
                        status: 2
                    },
                    {
                        where: {
                            [Op.and]: [
                                { code_purchase_request: codePR },
                                { code_item: item.code_item },
                            ],
                        },
                        transaction,
                    }
                );
            }
            return codeItemDetail.length;
        }
        async function updatePurchaseRequest(selectPurchaseOrderData) {
            const codePR = selectPurchaseOrderData.code_purchase_request
            return await model.log_purchase_request.update(
                {
                    status: 3,
                },
                {
                    where:
                    {
                        code_purchase_request: codePR,
                    },
                    transaction
                }
            )
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
            logger.info(`Update Return Purchase Order`, {
                "1.username": username,
                "2.module": "updateReturnPurchaseOrder",
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