const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const eppsLib = require('./epps');
const controller = {}
const { Op, json, fn, col } = require("sequelize")
const logger = require('./logger');

controller.selectWarehouse = async function (req, res) {
    try {
        let language = req.body.language_POST
        let warehouse = req.body.warehouse_POST
        let selectPeriodData = await model.fat_accounting_periods.findAll({
            where:
            {
                [Op.and]: [{ code_company: warehouse }, { status: 0 }]
            },
            order: [
                ["period", "DESC"]
            ],
            limit: 1
        });
        if (selectPeriodData.length > 0) {
            selectWarehose(selectPeriodData)
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectWarehose(selectPeriodData) {
            let warehouse = selectPeriodData[0]["code_company"]
            let period = selectPeriodData[0]["period"]
            let selectWarehoseData = await model.log_warehouse.findAll({
                include: [{
                    model: model.log_item_master,
                    // required: false // atau true, tergantung kamu ingin inner join atau left join
                }],
                where:
                {
                    [Op.and]: [{ warehouse: warehouse }, { period: period }]
                },
            });
            var data = {
                dataWarehouse: selectWarehoseData,
                dataPeriod: selectPeriodData
            }
            if (selectWarehoseData.length > 0) {
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
        return res.status(500).json({
            message: error.message || "Terjadi kesalahan pada server",
        });
    }
};
controller.selectWarehouseByItem = async function (req, res) {
    try {
        let language = req.body.language_POST
        let warehouse = req.body.warehouse_POST
        let itemCode = req.body.item_code_POST
        let selectPeriodData = await model.fat_accounting_periods.findAll({
            where:
            {
                [Op.and]: [{ code_company: warehouse }, { status: 0 }]
            },
            order: [
                ["period", "DESC"]
            ],
            limit: 1
        });
        if (selectPeriodData.length > 0) {
            selectWarehose(selectPeriodData)
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectWarehose(selectPeriodData) {
            let warehouse = selectPeriodData[0]["code_company"]
            let period = selectPeriodData[0]["period"]
            let selectWarehoseData = await model.log_warehouse.findAll({
                include: [{
                    model: model.log_item_master,
                }],
                where:
                {
                    [Op.and]: [
                        { warehouse: warehouse },
                        { period: period },
                        { code_item: itemCode }
                    ]
                },
            });
            if (selectWarehoseData.length > 0) {
                res.status(200).json({
                    access: "success",
                    data: selectWarehoseData
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
        return res.status(500).json({
            message: error.message || "Terjadi kesalahan pada server",
        });
    }
};
controller.selectWarehouseByItemWarehouse = async function (req, res) {
    try {
        let language = req.body.language_POST
        let warehouse = req.body.warehouse_POST
        let period = req.body.period_POST
        let selectWarehouseData = await model.log_warehouse.findAll({
            include: [{
                model: model.log_item_master,
            }],
            where:
            {
                [Op.and]: [
                    { warehouse: warehouse },
                    { period: period },
                ]
            },
        });
        if (selectWarehouseData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectWarehouseData
            });
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Terjadi kesalahan pada server",
        });
    }
};
controller.selectWarehouseByItemWarehouseDetail = async function (req, res) {
    try {
        let language = req.body.language_POST
        let warehouse = req.body.warehouse_POST
        let period = req.body.period_POST
        let codeItem = req.body.item_master_POST
        if (codeItem == "all") {
            warehouseItem =
            {
                [Op.and]:
                    [
                        { warehouse: warehouse },
                        { period: period },
                    ]
            }
        } else {
            warehouseItem =
            {
                [Op.and]: [
                    { warehouse: warehouse },
                    { period: period },
                    { code_item: codeItem }
                ]
            }
        }
        let selectWarehoseData = await model.log_warehouse.findAll({
            include: [{
                model: model.log_item_master,
                include: {
                    model: model.log_item_category
                }
            }],
            where: warehouseItem
        });
        if (selectWarehoseData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectWarehoseData
            });
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Terjadi kesalahan pada server",
        });
    }
};
controller.updateWarehouseClose = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const {
            language_POST: language,
            username_POST: username,
            warehouse_POST: warehouse,
            period_POST: period,
        } = req.body;

        const selectGoodsReceiptData = await selectGoodsReceipt();
        if (selectGoodsReceiptData.length > 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.incomplategoodreceipt);
        }
        const selectGoodsIssueData = await selectGoodsIssue();
        if (selectGoodsIssueData.length > 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.incomplategoodissue);
        }
        const warehouseData = await selectWarehouseByItem();
        if (warehouseData.length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const notBalanced = await selectBalanceMonthly(warehouseData);
        if (notBalanced.length) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.notBalance.replace("{{coa}}", `${notBalanced.join(', ')}`));
        }
        // if (!selectWarehouseByItemData) {
        //     await transaction.rollback();
        //     sendFailedResponse(messages[language]?.nodata);
        // }
        const updateAccountingPeriodsData = await updateAccountingPeriods(warehouseData);
        if (!updateAccountingPeriodsData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const insertBalanceMonthlyData = await insertBalanceMonthly(warehouseData);
        if (!insertBalanceMonthlyData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        const insertWarehouseData = await insertWarehouse(warehouseData);
        if (!insertWarehouseData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.closeperiodwarehouse.replace("{{period}}", period));
        logAction('success');

        async function selectGoodsReceipt() {
            return await model.log_goods_receipt.findAll({
                where: {
                    warehouse: warehouse,
                    [Op.and]: [
                        sequelize.where(
                            sequelize.cast(col('date'), 'text'),
                            { [Op.like]: `${period}%` }
                        )
                    ],
                    status: { [Op.in]: [0, 1] }
                },
                transaction
            });
        }
        async function selectGoodsIssue() {
            return await model.log_goods_issue.findAll({
                where: {
                    warehouse: warehouse,
                    [Op.and]: [
                        sequelize.where(
                            sequelize.cast(col('date'), 'text'),
                            { [Op.like]: `${period}%` }
                        )
                    ],
                    status: { [Op.in]: [0, 1] }
                },
                transaction
            });

        }
        async function selectWarehouseByItem() {
            return await model.log_warehouse.findAll({
                include: [
                    {
                        model: model.log_item_master,
                        include: {
                            model: model.log_item_category
                        }
                    },
                    {
                        model: model.adm_company,
                        as: "worksite"
                    },
                ],
                where: {
                    [Op.and]: [
                        { warehouse: warehouse },
                        { period: period },
                    ]
                },
                transaction
            });
        }
        async function selectBalanceMonthly(warehouseData) {
            const dataValueWarehoues = Object.entries(
                warehouseData.reduce((acc, row) => {
                    const coa = row.log_item_master.log_item_category.code_coa;
                    const result = parseFloat(row.beginning_price * row.initial_qty) + parseFloat(row.incoming_price * row.incoming_qty) - parseFloat(row.outgoing_price * row.outgoing_qty)
                    acc[coa] = (acc[coa] || 0) + result;
                    return acc;
                }, {})
            ).map(([code_coa, result]) => ({ code_coa, result }));

            const worksite = warehouseData[0]["worksite"]["parent_code"]
            var arrIdCoa = [];
            for (var i = 0; i < dataValueWarehoues.length; i++)
                arrIdCoa.push(dataValueWarehoues[i]["code_coa"]);

            const selectBalanceMonthlyData = await model.fat_balance_monthly.findAll({
                where: {
                    [Op.and]: [
                        { code_coa: arrIdCoa },
                        { period_date: period },
                        { worksite: worksite },
                        {
                            status:
                            {
                                [Op.in]: [0, 1]
                            }
                        },
                    ]
                },
                transaction
            });

            const dataValueBalanceMothly = Object.entries(
                selectBalanceMonthlyData.reduce((acc, row) => {
                    const coa = row.code_coa;
                    const result = parseFloat(row.opening_balance) + parseFloat(row.debit) - parseFloat(row.credit)
                    acc[coa] = (acc[coa] || 0) + result;
                    return acc;
                }, {})
            ).map(([code_coa, result]) => ({ code_coa, result }));
            const monthlyLookup = dataValueBalanceMothly.reduce((acc, row) => {
                acc[row.code_coa] = row.result;
                return acc;
            }, {});
            res.json([dataValueWarehoues,dataValueBalanceMothly])
            const notBalanced = dataValueWarehoues
                .filter(row => row.result !== monthlyLookup[row.code_coa])
                .map(row => row.code_coa);
            // if (notBalanced.length) {
            //     await transaction.rollback();
            //     return sendFailedResponse(messages[language]?.notBalance.replace("{{coa}}", `${notBalanced.join(', ')}`));
            // }
            return notBalanced;
        }
        async function updateAccountingPeriods(warehouseData) {
            const worksite = warehouseData[0]["warehouse"]
            await model.fat_accounting_periods.update(
                {
                    status: 1
                },
                {
                    where: {
                        [Op.and]: [
                            { period: period },
                            { code_company: worksite },
                        ]
                    },
                    transaction
                }
            );

            const [y, m] = period.split('-').map(Number);
            const d = new Date(y, m - 1);
            d.setMonth(d.getMonth() + 1);

            const periodNew = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const rangerMonth = eppsLib.getMonthRange(periodNew);

            return await model.fat_accounting_periods.create(
                {
                    status: 0,
                    code_company: worksite,
                    period: periodNew,
                    start_date: rangerMonth["start"],
                    finish_date: rangerMonth["end"]
                },
                { transaction }
            );
        }
        async function insertBalanceMonthly(warehouseData) {
            const code_company = warehouseData[0]["code_company"]
            const worksite = warehouseData[0]["worksite"]["parent_code"]
            const [y, m] = period.split('-').map(Number);
            const d = new Date(y, m - 1);
            d.setMonth(d.getMonth() + 1);
            const periodNew = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            const result = Object.values(
                warehouseData.reduce((acc, r) => {
                    const k = r.log_item_master.log_item_category.code_coa;
                    const qty = r.initial_qty + r.incoming_qty - r.outgoing_qty;
                    const harga = parseFloat(r.beginning_price * r.initial_qty) + parseFloat(r.incoming_price * r.incoming_qty) - parseFloat(r.outgoing_price * r.outgoing_qty)
                    if (!acc[k]) {
                        acc[k] = {
                            code_coa: k,
                            total_harga: 0,
                        };
                    }

                    acc[k].total_harga += harga;

                    return acc;
                }, {})
            );

            const common = {
                code_company,
                worksite,
                period_date: periodNew,
                status: 0
            };

            const rowsToInsert = result.map(r => ({
                ...common,
                code_coa: r.code_coa,
                opening_balance: r.total_harga,
            }));

            return await model.fat_balance_monthly.bulkCreate(rowsToInsert, { transaction });
        }
        async function insertWarehouse(warehouseData) {
            const code_company = warehouseData[0]["code_company"];
            const warehouse = warehouseData[0]["warehouse"];
            const storage_location = warehouseData[0]["storage_location"]; // Ambil storage_location dari data pertama

            const [y, m] = period.split('-').map(Number);
            const d = new Date(y, m - 1);
            d.setMonth(d.getMonth() + 1);
            const periodNew = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            const result = Object.values(
                warehouseData.reduce((acc, r) => {
                    const k = r.code_item;
                    const qty = r.initial_qty + r.incoming_qty - r.outgoing_qty;
                    const harga = parseFloat(r.beginning_price * r.initial_qty) +
                        parseFloat(r.incoming_price * r.incoming_qty) -
                        parseFloat(r.outgoing_price * r.outgoing_qty);

                    if (!acc[k]) {
                        acc[k] = {
                            code_item: k,
                            total_qty: 0,
                            total_harga: 0,
                            storage_location: r.storage_location // Simpan storage_location per item
                        };
                    }

                    acc[k].total_qty += qty;
                    acc[k].total_harga += harga;

                    return acc;
                }, {})
            ).map(o => ({
                ...o,
                unit_price: o.total_qty ? o.total_harga / o.total_qty : 0
            }));

            const rowsToInsert = result.map(r => ({
                code_company: code_company,
                warehouse: warehouse,
                period: periodNew,
                storage_location: r.storage_location, // Gunakan storage_location dari hasil reduce
                code_item: r.code_item,
                initial_qty: r.total_qty,
                beginning_price: r.unit_price
            }));
            return await model.log_warehouse.bulkCreate(rowsToInsert, { transaction });
        }
        function sendSuccessResponse(message, data = null) {
            const response = {
                access: "success",
                message: message
            };
            if (data) response.data = data;
            res.status(200).json(response);
        }
        // function sendFailedResponse(message, data = null) {
        //     const response = {
        //         access: "failed",
        //         message: message
        //     };
        //     if (data) response.data = data;
        //     res.status(200).json(response);
        // }
        function sendFailedResponse(message) {
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
        function logAction(status, action = 'Approval') {
            logger.info(`Update Warehouse Close`, {
                "1.username": username,
                "2.module": "updateWarehouseClose",
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
controller.selectReconciliationWarehouseClose = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const {
            language_POST: language,
            username_POST: username,
            warehouse_POST: warehouse,
            period_POST: period,
        } = req.body;

        const selectGoodsReceiptData = await selectGoodsReceipt();
        // if (selectGoodsReceiptData.length === 0) {
        //     await transaction.rollback();
        //     return sendFailedResponse(messages[language]?.incomplategoodreceipt);
        // }
        const selectGoodsIssueData = await selectGoodsIssue();
        // if (selectGoodsIssueData.length === 0) {
        //     await transaction.rollback();
        //     return sendFailedResponse(messages[language]?.incomplategoodissue);
        // }
        const warehouseData = await selectWarehouseByItem();
        const selectBalanceMonthlyData = await selectBalanceMonthly(warehouseData);
        var data = {
            dataGoodReceipt: selectGoodsReceiptData,
            dataGoodIssue: selectGoodsIssueData,
            dataWareHouse: warehouseData,
            dataBalanceMonthly: selectBalanceMonthlyData
        }
        // res.json(data)
        // await transaction.rollback();
        // return false
        await transaction.commit();
        sendSuccessResponse(messages[language]?.successfulData, data);

        async function selectGoodsReceipt() {
            return await model.log_goods_receipt.findAll({
                include: [
                    {
                        model: model.log_goods_receipt_detail,
                        include: [
                            {
                                model: model.log_item_master,
                                attributes: ["code_item"],
                                include: [
                                    {
                                        model: model.log_item_category,
                                        attributes: ["code_coa"],
                                    }
                                ],
                            }
                        ],
                        as: "details"
                    }
                ],
                where: {
                    warehouse: warehouse,
                    [Op.and]: [
                        sequelize.where(
                            sequelize.cast(col('date'), 'text'),
                            { [Op.like]: `${period}%` }
                        )
                    ],
                    status: { [Op.in]: [0, 1, 2] }
                },
                transaction
            });
        }
        async function selectGoodsIssue() {
            return await model.log_goods_issue.findAll({
                include: [
                    {
                        model: model.log_goods_issue_detail,
                        include: [
                            {
                                model: model.log_item_master,
                                attributes: ["code_item"],
                                include: [
                                    {
                                        model: model.log_item_category,
                                        attributes: ["code_coa"],
                                    }
                                ],
                            }
                        ],
                        as: "details"
                    }
                ],
                where: {
                    warehouse: warehouse,
                    [Op.and]: [
                        sequelize.where(
                            sequelize.cast(col('date'), 'text'),
                            { [Op.like]: `${period}%` }
                        )
                    ],
                    status: { [Op.in]: [0, 1, 2] }
                },
                transaction
            });

        }
        async function selectWarehouseByItem() {
            return await model.log_warehouse.findAll({
                include: [
                    {
                        model: model.log_item_master,
                        include: {
                            model: model.log_item_category
                        }
                    },
                    {
                        model: model.adm_company,
                        as: "worksite"
                    },
                ],
                where: {
                    [Op.and]: [
                        { warehouse: warehouse },
                        { period: period },
                    ]
                },
                transaction
            });
        }
        async function selectBalanceMonthly(warehouseData) {
            const dataValueWarehoues = Object.entries(
                warehouseData.reduce((acc, row) => {
                    const coa = row.log_item_master.log_item_category.code_coa;
                    const result = parseFloat(row.beginning_price * row.initial_qty) + parseFloat(row.incoming_price * row.incoming_qty) - parseFloat(row.outgoing_price * row.outgoing_qty)
                    acc[coa] = (acc[coa] || 0) + result;
                    return acc;
                }, {})
            ).map(([code_coa, result]) => ({ code_coa, result }));

            const worksite = warehouseData[0]["worksite"]["parent_code"]
            var arrIdCoa = [];
            for (var i = 0; i < dataValueWarehoues.length; i++)
                arrIdCoa.push(dataValueWarehoues[i]["code_coa"]);

            return await model.fat_balance_monthly.findAll({
                where: {
                    [Op.and]: [
                        { code_coa: arrIdCoa },
                        { period_date: period },
                        { worksite: worksite },
                        {
                            status:
                            {
                                [Op.in]: [0, 1]
                            }
                        },
                    ]
                },
                transaction
            });
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
            logger.info(`Update Warehouse Close`, {
                "1.username": username,
                "2.module": "updateWarehouseClose",
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