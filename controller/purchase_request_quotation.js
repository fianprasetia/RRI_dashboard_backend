const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectPurchaseRequestQuotation = async function (req, res) {
    try {
        const language = req.body.language_POST
        const employee = req.body.employeeID_POST
        let selectPurchaseRequestQuotationData = await model.log_purchase_request_quotation.findAll({
            include: [
                {
                    model: model.log_partners,
                    attributes: ["name", "city"]
                },
            ],
            where:
            {
                [Op.and]:
                    [
                        { employee_purchasing: employee, },
                        { status: 0 }
                    ]
            },
            order: [
                ['code_purchase_request', 'DESC'],
                ['code_purchase_request_quotation', 'ASC'],
            ],
        });
        if (selectPurchaseRequestQuotationData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectPurchaseRequestQuotationData,
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
controller.selectPurchaseRequestQuotationByCode = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var code = req.body.code_purchase_request_quotation_POST
        let selectPurchaseRequestQuotationByCodeData = await model.log_purchase_request_quotation.findAll({
            include: [
                {
                    model: model.log_partners,
                },
                // {
                //     model: model.log_purchase_request,
                //     include: {
                //         model: model.log_purchase_request_detail,
                //     }
                // },
                {
                    model: model.adm_company,
                    attributes: ["name", "address", "city"],

                },
                {
                    model: model.log_term_of_payment,
                    attributes: ["code_term_of_payment"],
                    include: {
                        model: model.log_term_of_payment_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_employee,
                    as: "employeePurchasing",
                    attributes: ["fullname"]
                },
                {
                    model: model.log_receiving_locations,
                },
                {
                    model: model.log_purchase_request_quotation_detail,
                    include: {
                        model: model.log_item_master

                    },
                    as: "details"
                },
            ],
            where: {
                code_purchase_request_quotation: code,
            },
            transaction: transaction,
        });
        if (selectPurchaseRequestQuotationByCodeData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectPurchaseRequestQuotationByCodeData,
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
controller.insertPurchaseRequestQuotation = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body[0]["language_POST"]
        const employeeID = req.body[0]["employeeID_POST"]
        const username = req.body[0]["username_POST"]
        const codeCompany = req.body[0]["company_code_POST"]
        const worksite = req.body[0]["worksite_code_POST"]
        const partners = req.body[0]["partners_POST"]
        const orderDate = req.body[0]["order_date_POST"]
        const deliveryDate = req.body[0]["delivery_date_POST"]
        const note = req.body[0]["note_POST"]
        const currency = req.body[0]["currency_POST"]
        const exchangeRate = req.body[0]["exchange_rate_POST"]
        const purchaseRequest = req.body[0]["purchase_request_POST"]
        const termOfPayment = req.body[0]["term_of_payment_POST"]
        const receivingLocations = req.body[0]["receiving_locations_POST"]
        const subTotal = req.body[0]["subtotal_POST"]
        const nominalDiskon = req.body[0]["nominal_diskon_POST"]
        const shipping = req.body[0]["shipping_POST"]
        const vatNominal = req.body[0]["ppn_nominal_POST"]
        const grandTotal = req.body[0]["grand_total_POST"]
        const yearAndMonth = orderDate.split("-").slice(0, 2).join("-");
        const formattedDate = orderDate.split("-").slice(0, 2).join("");
        var selectPurchaseRequestQuotationData = await model.log_purchase_request_quotation.findAll({
            where:
            {
                [Op.and]: [
                    { worksite: worksite },
                    Sequelize.where(
                        Sequelize.fn('to_char', Sequelize.col('date_request'), 'YYYY-MM'), // Format tanggal menjadi 'YYYY-MM'
                        yearAndMonth // '2024-12'
                    )
                ]
            },
            transaction: transaction
        }
        );
        if (selectPurchaseRequestQuotationData.length > 0) {
            var idsubstring = []
            var idsubstringPush = []
            var idsubstringMax
            for (var i = 0; i < selectPurchaseRequestQuotationData.length; i++) {
                idsubstring = selectPurchaseRequestQuotationData[i]['code_purchase_request_quotation'].split("/")[0];
                idsubstringPush.push(idsubstring);
                idsubstringMax = Math.max.apply(null, idsubstringPush)
            }
            var endsubstringCodeInt = parseInt(idsubstringMax) + 1
            let noUrut = (endsubstringCodeInt.toString()).padStart(3, "0")
            newCode = noUrut + "/RFQ/" + worksite + "/" + codeCompany + "/" + formattedDate
            insertPurchaseRequestQuotation(newCode)
        } else {
            no = "1"
            let noUrut = no.padStart(3, "0")
            newCode = noUrut + "/RFQ/" + worksite + "/" + codeCompany + "/" + formattedDate
            insertPurchaseRequestQuotation(newCode)
        }
        async function insertPurchaseRequestQuotation(newCode) {
            var insertPurchaseRequestQuotationData = await model.log_purchase_request_quotation.create(
                {
                    code_purchase_request_quotation: newCode,
                    code_company: codeCompany,
                    worksite: worksite,
                    employee_purchasing: employeeID,
                    code_purchase_request: purchaseRequest,
                    code_partners: partners,
                    code_term_of_payment: termOfPayment,
                    id_receiving_locations: receivingLocations,
                    date_request: orderDate,
                    date_delivery: deliveryDate,
                    note: note,
                    currency: currency,
                    exchange_rate: exchangeRate,
                    discount: nominalDiskon,
                    subtotal: subTotal,
                    shipping_cost: shipping,
                    vat: vatNominal,
                    grand_total: grandTotal,
                    status: 0,
                },
                {
                    transaction: transaction
                }
            );
            if (insertPurchaseRequestQuotationData) {
                insertPurchaseRequestQuotationDetail(newCode)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }

        }
        async function insertPurchaseRequestQuotationDetail(newCode) {
            jmlData = req.body[0]["detail"]
            var dataPurcasheRequestQuotationDetail = []
            for (var i = 0; i < jmlData.length; i++) {
                const newCodeDetail = JSON.parse('{"code_purchase_request_quotation": "' + newCode + '"}')
                const codeItemDetail = JSON.parse('{"code_item": "' + req.body[0]["detail"][i].code_item_POST + '"}')
                const noteDetail = JSON.parse('{"note": "' + req.body[0]["detail"][i].note_POST + '"}')
                const qtyRequestDetail = JSON.parse('{"qty": ' + req.body[0]["detail"][i].qty_POST + '}')
                const qtypriceDetail = JSON.parse('{"price": ' + req.body[0]["detail"][i].price_POST + '}')
                const statusDetail = JSON.parse('{"status": 0}')
                extend(newCodeDetail, codeItemDetail, noteDetail, qtyRequestDetail, qtypriceDetail, statusDetail);
                dataPurcasheRequestQuotationDetail.push(newCodeDetail);
            }
            var dataPurcasheRequestDetailData = await model.log_purchase_request_quotation_detail.bulkCreate(
                dataPurcasheRequestQuotationDetail,
                {
                    transaction: transaction
                }
            );
            if (dataPurcasheRequestDetailData) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: dataPurcasheRequestDetailData,
                });
                logger.info('Insert Purchase Request Quotation', {
                    "1.username": `${username}`,
                    "2.module": 'insertPurchaseRequestQuotation',
                    "3.status": 'success',
                    "4.action": req.body
                });
                // selectUserApproval(newCode)
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
controller.updatePurchaseRequestQuotaion = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body[0]["language_POST"]
        const username = req.body[0]["username_POST"]
        const code = req.body[0]["code_POST"]
        const employeeID = req.body[0]["employeeID_POST"]
        const codeCompany = req.body[0]["company_code_POST"]
        const worksite = req.body[0]["worksite_code_POST"]
        const partners = req.body[0]["partners_POST"]
        const orderDate = req.body[0]["order_date_POST"]
        const deliveryDate = req.body[0]["delivery_date_POST"]
        const note = req.body[0]["note_POST"]
        const currency = req.body[0]["currency_POST"]
        const exchangeRate = req.body[0]["exchange_rate_POST"]
        const purchaseRequest = req.body[0]["purchase_request_POST"]
        const termOfPayment = req.body[0]["term_of_payment_POST"]
        const receivingLocations = req.body[0]["receiving_locations_POST"]
        const subTotal = req.body[0]["subtotal_POST"]
        const nominalDiskon = req.body[0]["nominal_diskon_POST"]
        const shipping = req.body[0]["shipping_POST"]
        const vatNominal = req.body[0]["ppn_nominal_POST"]
        const grandTotal = req.body[0]["grand_total_POST"]
        let updatePurchaseRequestQuotaionData = await model.log_purchase_request_quotation.update(
            {
                code_company: codeCompany,
                worksite: worksite,
                employee_purchasing: employeeID,
                code_purchase_request: purchaseRequest,
                code_partners: partners,
                code_term_of_payment: termOfPayment,
                id_receiving_locations: receivingLocations,
                date_request: orderDate,
                date_delivery: deliveryDate,
                note: note,
                currency: currency,
                exchange_rate: exchangeRate,
                discount: nominalDiskon,
                subtotal: subTotal,
                shipping_cost: shipping,
                vat: vatNominal,
                grand_total: grandTotal,
                status: 0,
            },
            {
                where:
                {
                    code_purchase_request_quotation: code
                },
                transaction: transaction
            },
        );
        if (updatePurchaseRequestQuotaionData) {
            deletePurchaseRequestQutationDetail()
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }

        async function deletePurchaseRequestQutationDetail() {
            let deletePurchaseRequestQutationDetailData = await model.log_purchase_request_quotation_detail.destroy({
                where: {
                    code_purchase_request_quotation: code
                },
                transaction: transaction
            });
            if (deletePurchaseRequestQutationDetailData) {
                insertPurchaseRequestQuotationDetail()
            } else {
                await transaction.rollback();
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
        async function insertPurchaseRequestQuotationDetail() {
            jmlData = req.body[0]["detail"]
            var dataPurcasheRequestQuotationDetail = []
            for (var i = 0; i < jmlData.length; i++) {
                const CodeDetail = JSON.parse('{"code_purchase_request_quotation": "' + code + '"}')
                const codeItemDetail = JSON.parse('{"code_item": "' + req.body[0]["detail"][i].code_item_POST + '"}')
                const noteDetail = JSON.parse('{"note": "' + req.body[0]["detail"][i].note_POST + '"}')
                const qtyRequestDetail = JSON.parse('{"qty": ' + req.body[0]["detail"][i].qty_POST + '}')
                const qtypriceDetail = JSON.parse('{"price": ' + req.body[0]["detail"][i].price_POST + '}')
                const statusDetail = JSON.parse('{"status": 0}')
                extend(CodeDetail, codeItemDetail, noteDetail, qtyRequestDetail, qtypriceDetail, statusDetail);
                dataPurcasheRequestQuotationDetail.push(CodeDetail);
            }
            var updatePurcasheRequestDetailData = await model.log_purchase_request_quotation_detail.bulkCreate(
                dataPurcasheRequestQuotationDetail,
                {
                    transaction: transaction
                }
            );

            if (updatePurcasheRequestDetailData) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: updatePurcasheRequestDetailData,
                });
                logger.info('Update Purchase Request Quotaion', {
                    "1.username": `${username}`,
                    "2.module": 'updatePurchaseRequestQuotaion',
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
controller.updatePostingPurchaseRequestQuotation = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {

        const {
            language_POST: language,
            username_POST: username,
            code_purchase_request_qoutation_POST: codeRfq,
        } = req.body;
        const updatePurchaseRequestQuotationData = await updatePurchaseRequestQuotation();
        if (!updatePurchaseRequestQuotationData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        const updatePostingPurchaseRequestQuotationDetailData = await updatePostingPurchaseRequestQuotationDetail()
        if (!updatePostingPurchaseRequestQuotationDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const selectPurchaseRequestQuotationData = await selectPurchaseRequestQuotation()
        if (selectPurchaseRequestQuotationData.length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const checkRFQOverRequestQtyData = await checkRFQOverRequestQty(selectPurchaseRequestQuotationData)
        if (!checkRFQOverRequestQtyData.valid) {
            await transaction.rollback();
            // return sendFailedResponse(messages[language]?.qtyExceeds);
            return sendFailedResponse(
                `${messages[language]?.qtyExceeds} (${checkRFQOverRequestQtyData.code_item})`
            );
        }
        const updatePurchaseRequestDetailQtyRFQData = await updatePurchaseRequestDetailQtyRFQ(selectPurchaseRequestQuotationData)
        if (!updatePurchaseRequestDetailQtyRFQData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        await updatePurchaseRequestDetail(selectPurchaseRequestQuotationData)

        const selectPurchaseRequestDetailData = await selectPurchaseRequestDetail(selectPurchaseRequestQuotationData)
        if (selectPurchaseRequestDetailData.length === 0) {
            await updatePurchaseRequest(selectPurchaseRequestQuotationData)
        }
        const newCode = await selectPurchaseOrder(selectPurchaseRequestQuotationData)

        const insertPurchaseOrderData = await insertPurchaseOrder(newCode, selectPurchaseRequestQuotationData)
        if (!insertPurchaseOrderData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        const insertPurchaseOrderDetailData = await insertPurchaseOrderDetail(newCode, selectPurchaseRequestQuotationData)
        if (!insertPurchaseOrderDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.postingData, { insertPurchaseOrderData, insertPurchaseOrderDetailData });
        logAction('success');

        async function updatePurchaseRequestQuotation() {
            return await model.log_purchase_request_quotation.update(
                {
                    status: 1
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
        async function updatePostingPurchaseRequestQuotationDetail() {
            return await model.log_purchase_request_quotation_detail.update(
                {
                    status: 1,
                },
                {
                    where: {
                        code_purchase_request_quotation: codeRfq
                    },
                    transaction
                }
            )
        }
        async function selectPurchaseRequestQuotation() {
            return await model.log_purchase_request_quotation.findAll({
                include: [
                    {
                        model: model.log_purchase_request_quotation_detail,
                        as: "details"
                    },
                    {
                        model: model.log_purchase_request,
                        include: [
                            {
                                model: model.log_purchase_request_detail,
                            }
                        ]
                    },
                ],
                where: {
                    code_purchase_request_quotation: codeRfq
                },
                transaction
            });
        }
        async function checkRFQOverRequestQty(selectPurchaseRequestQuotationData) {
            const codePR = selectPurchaseRequestQuotationData[0].code_purchase_request;
            const codeItemDetail = selectPurchaseRequestQuotationData[0].details;

            for (const item of codeItemDetail) {
                const checkQty = await model.log_purchase_request_detail.findOne({
                    where: {
                        [Op.and]: [
                            { code_purchase_request: codePR },
                            { code_item: item.code_item },
                        ],
                    },
                    transaction,
                });

                if (checkQty) {
                    const sisaQty = checkQty.qty_actual - checkQty.qty_rfq;

                    // Jika sisa qty lebih kecil dari qty RFQ, kirim info item yang gagal
                    if (sisaQty < item.qty) {
                        return {
                            valid: false,
                            code_item: item.code_item, // kirim item yang gagal
                        };
                    }
                }
            }

            return { valid: true }; // semua aman
        }
        async function updatePurchaseRequestDetailQtyRFQ(selectPurchaseRequestQuotationData,) {
            const codePR = selectPurchaseRequestQuotationData[0].code_purchase_request;
            const codeItemDetail = selectPurchaseRequestQuotationData[0].details;
            for (const item of codeItemDetail) {
                await model.log_purchase_request_detail.update(
                    {
                        qty_rfq: Sequelize.literal(`qty_rfq + ${item.qty}`),
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
        async function updatePurchaseRequestDetail(selectPurchaseRequestQuotationData) {
            const codePR = selectPurchaseRequestQuotationData[0].code_purchase_request;
            const codeItemDetail = selectPurchaseRequestQuotationData[0].details;
            const codeItems = codeItemDetail.map(item => item.code_item);
            const details = await model.log_purchase_request_detail.findAll({
                where: {
                    [Op.and]: [
                        { code_purchase_request: codePR },
                        { code_item: { [Op.in]: codeItems } }
                    ]
                },
                transaction
            });
            const updates = details
                .filter(item => item.qty_actual === item.qty_rfq)
                .map(item =>
                    model.log_purchase_request_detail.update(
                        { status: 3 },
                        {
                            where: {
                                [Op.and]: [
                                    { code_purchase_request: item.code_purchase_request },
                                    { code_item: item.code_item }
                                ]
                            },
                            transaction
                        }
                    )
                );

            await Promise.all(updates);

            return updates.length;
        }
        async function selectPurchaseRequestDetail(selectPurchaseRequestQuotationData) {
            const codePR = selectPurchaseRequestQuotationData[0].code_purchase_request
            return await model.log_purchase_request_detail.findAll({
                where:
                {
                    [Op.and]:
                        [
                            { code_purchase_request: codePR },
                            { status: 2 },
                        ]
                },
                transaction
            });
        }
        async function updatePurchaseRequest(selectPurchaseRequestQuotationData) {
            const codePR = selectPurchaseRequestQuotationData[0].code_purchase_request
            return await model.log_purchase_request.update(
                {
                    status: 4,
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
        async function selectPurchaseOrder(selectPurchaseRequestQuotationData) {
            const date = new Date()
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Tambahkan 1 karena getMonth() dimulai dari 0
            const day = String(date.getDate()).padStart(2, '0');
            const yearAndMonth = `${year}-${month}`;
            const formattedDate = `${year}${month}`;
            const dateCreate = `${year}-${month}-${day}`;
            const codeCompany = selectPurchaseRequestQuotationData[0].code_company
            const type = selectPurchaseRequestQuotationData[0].log_purchase_request.type
            let selectPurchaseOrderData = await model.log_purchase_order.findAll({
                where:
                {
                    [Op.and]: [
                        { code_company: codeCompany },
                        Sequelize.where(
                            Sequelize.fn('to_char', Sequelize.col('date_create'), 'YYYY-MM'), // Format tanggal menjadi 'YYYY-MM'
                            yearAndMonth // '2024-12'
                        )
                    ]
                },
                transaction: transaction
            });
            let sequenceNumber;
            if (selectPurchaseOrderData.length > 0) {
                var idsubstring = []
                var idsubstringPush = []
                var idsubstringMax
                for (var i = 0; i < selectPurchaseOrderData.length; i++) {
                    idsubstring = selectPurchaseOrderData[i]['code_purchase_order'].split("/")[0];
                    idsubstringPush.push(idsubstring);
                    idsubstringMax = Math.max.apply(null, idsubstringPush)
                }
                var endsubstringCodeInt = parseInt(idsubstringMax) + 1
                sequenceNumber = (endsubstringCodeInt.toString()).padStart(3, "0")
            } else {
                sequenceNumber = "001";
            }
            return `${sequenceNumber}/PO/${codeCompany}/${type}/${formattedDate}`;
        }
        async function insertPurchaseOrder(newCode, selectPurchaseRequestQuotationData) {
            const date = new Date()
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Tambahkan 1 karena getMonth() dimulai dari 0
            const day = String(date.getDate()).padStart(2, '0');
            const dateCreate = `${year}-${month}-${day}`;
            const codeCompany = selectPurchaseRequestQuotationData[0].code_company
            const worksite = selectPurchaseRequestQuotationData[0].worksite
            const grandTotal = selectPurchaseRequestQuotationData[0].grand_total
            const employeePurchasing = selectPurchaseRequestQuotationData[0].employee_purchasing
            const codePurchaseRequest = selectPurchaseRequestQuotationData[0].code_purchase_request
            const codePartners = selectPurchaseRequestQuotationData[0].code_partners
            const code_TOP = selectPurchaseRequestQuotationData[0].code_term_of_payment
            const idReceivingLocations = selectPurchaseRequestQuotationData[0].id_receiving_locations
            const dateDelivery = selectPurchaseRequestQuotationData[0].date_delivery
            const note = selectPurchaseRequestQuotationData[0].note
            const currency = selectPurchaseRequestQuotationData[0].currency
            const exchangeRate = selectPurchaseRequestQuotationData[0].exchange_rate
            const subtotal = selectPurchaseRequestQuotationData[0].subtotal
            const discount = selectPurchaseRequestQuotationData[0].discount
            const shippingCost = selectPurchaseRequestQuotationData[0].shipping_cost
            const vat = selectPurchaseRequestQuotationData[0].vat
            return await model.log_purchase_order.create(
                {
                    code_purchase_order: newCode,
                    code_company: codeCompany,
                    worksite: worksite,
                    employee_purchasing: employeePurchasing,
                    employee_approval: null,
                    code_purchase_request: codePurchaseRequest,
                    code_partners: codePartners,
                    code_term_of_payment: code_TOP,
                    id_receiving_locations: idReceivingLocations,
                    date_create: dateCreate,
                    date_release: null,
                    date_delivery: dateDelivery,
                    note: note,
                    currency: currency,
                    exchange_rate: exchangeRate,
                    subtotal: subtotal,
                    discount: discount,
                    shipping_cost: shippingCost,
                    vat: vat,
                    grand_total: grandTotal,
                    status: 0,
                    remaining_subtotal: grandTotal,
                    code_purchase_request_quotation: codeRfq,
                },
                {
                    transaction: transaction
                }
            );
            // if (insertPurchaseOrderData) {
            //     insertPurchaseOrderDetail(newCode, details)
            // } else {
            //     await transaction.rollback()
            //     res.status(200).json({
            //         access: "failed",
            //         message: messages[language]?.failedData,
            //     });
            // }

        }
        async function insertPurchaseOrderDetail(newCode, selectPurchaseRequestQuotationData) {
            const details = selectPurchaseRequestQuotationData[0].details
            var dataPurcasheOrderDetail = []
            for (var i = 0; i < details.length; i++) {
                const newCodeDetail = JSON.parse('{"code_purchase_order": "' + newCode + '"}')
                const codeItemDetail = JSON.parse('{"code_item": "' + details[i].code_item + '"}')
                const noteDetail = JSON.parse('{"note": "' + details[i].note + '"}')
                const qtyDetail = JSON.parse('{"qty": ' + details[i].qty + '}')
                const qtyReceived = JSON.parse('{"qty_received": 0}')
                const pricelDetail = JSON.parse('{"price": ' + details[i].price + '}')
                const statusDetail = JSON.parse('{"status": 0}')
                extend(newCodeDetail, codeItemDetail, noteDetail, qtyDetail, qtyReceived, pricelDetail, statusDetail);
                dataPurcasheOrderDetail.push(newCodeDetail);
            }
            return await model.log_purchase_order_detail.bulkCreate(
                dataPurcasheOrderDetail,
                {
                    transaction: transaction
                }
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
            logger.info('Update Posting Purchase Request Quotation', {
                "1.username": `${username}`,
                "2.module": 'updatePostingPurchaseRequestQuotation',
                "3.status": 'success',
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
controller.deletePurchaseRequestQuotation = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const username = req.body.username_POST
        const code = req.body.code_purchase_request_qoutation_POST
        let updatePostingPurchaseRequestQuotationData = await model.log_purchase_request_quotation.update(
            {
                status: 2,
            },
            {
                where:
                {
                    code_purchase_request_quotation: code
                },
                transaction: transaction
            },
        );
        if (updatePostingPurchaseRequestQuotationData) {
            await updatePostingPurchaseRequestDetailQuotation()
        } else {
            await transaction.rollback()
            return res.status(200).json({
                message: " Tidak ada data",
                data: [],
            });
        }

        async function updatePostingPurchaseRequestDetailQuotation() {
            let updatePostingPurchaseRequestQuotationDetailData = await model.log_purchase_request_quotation_detail.update(
                {
                    status: 2,
                },
                {
                    where: {
                        code_purchase_request_quotation: code
                    },
                    transaction: transaction
                }
            )
            if (updatePostingPurchaseRequestQuotationDetailData.length > 0) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.deleteData,
                    data: updatePostingPurchaseRequestQuotationDetailData,
                });
                logger.info('Delete Purchase Request Quotation', {
                    "1.username": `${username}`,
                    "2.module": 'deletePurchaseRequestQuotation',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback();
                es.status(200).json({
                    access: "failed",
                    message: messages[language]?.nodata,
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
controller.selectPurchaseRequestQuotationByPurchaseRequest = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            code_purchase_request_POST: code,
        } = requestData;

        const selectPurchaseRequestData = await selectPurchaseRequest()
        if (selectPurchaseRequestData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }
        const selectPurchaseRequestQuotationData = await selectPurchaseRequestQuotation(selectPurchaseRequestData)
        if (selectPurchaseRequestQuotationData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectPurchaseRequestQuotationData);
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

        async function selectPurchaseRequest() {
            return await model.log_purchase_request_detail.findAll({
                attributes: ["code_purchase_request", "code_item"],
                include: {
                    model: model.log_item_master

                },
                where: {
                    code_purchase_request: code
                },
                order: [
                    ["code_item", "ASC"]
                ]
            });
        }
        async function selectPurchaseRequestQuotation(selectPurchaseRequestData) {
            var dataRaw = await model.log_purchase_request_quotation.findAll({
                attributes: ["code_purchase_request_quotation", "date_request", "date_delivery", "currency", "exchange_rate", "subtotal", "discount", "shipping_cost", "vat", "grand_total"],
                include: [
                    {
                        model: model.log_partners,
                        attributes: ["name"]
                    },
                    {
                        model: model.log_term_of_payment,
                        attributes: ["code_term_of_payment"],
                        include: {
                            model: model.log_term_of_payment_translations,
                            attributes: ["translation"],
                            where: { language_code: language },
                        },
                    },
                    {
                        model: model.log_receiving_locations,
                    },
                    {
                        model: model.log_purchase_request_quotation_detail,
                        attributes: ["code_item", "qty", "price"],
                        as: "details",
                    },
                ],
                where:
                {
                    [Op.and]: [
                        {
                            code_purchase_request: code
                        },
                        {
                            status: 0
                        }
                    ]

                },
                order: [
                    [{ model: model.log_purchase_request_quotation_detail, as: "details" }, "code_purchase_request_quotation", "ASC"],
                    [{ model: model.log_purchase_request_quotation_detail, as: "details" }, "code_item", "ASC"]
                ]
            });
            const dataQuotation = dataRaw.map(pr => pr.get({ plain: true }));
            const allCodeItems = selectPurchaseRequestData.map(item => item.code_item);
            dataQuotation.forEach(pr => {
                allCodeItems.forEach(codeItem => {
                    const exists = pr.details.some(detail => detail.code_item === codeItem);
                    if (!exists) {
                        pr.details.push({
                            code_item: codeItem,
                            qty: 0,
                            price: 0
                        });
                    }
                });
                pr.details.sort((a, b) => a.code_item - b.code_item);
            });

            return { selectPurchaseRequestData, dataQuotation }
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
}

module.exports = controller;    