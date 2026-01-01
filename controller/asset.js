const model = require("../models/index")
const messages = require("./message")
const eppsLib = require('./epps');
const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, literal, json } = require("sequelize")
const logger = require('./logger');

controller.selectAsset = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectAssetData = await model.fat_asset.findAll({
            include: [
                {
                    model: model.log_item_master,
                },
            ],
            order: [
                ['status', 'ASC'],
                ['asset_code', 'ASC'],
                ['createdAt', 'ASC'],
            ],
        });
        if (selectAssetData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectAssetData,
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
controller.selectAssetByCode = async function (req, res) {
    try {
        var language = req.body.language_POST
        var code = req.body.code_POST
        let selectAssetByCodeData = await model.fat_asset.findAll({
            include: [
                {
                    model: model.log_item_master,
                },
                {
                    model: model.adm_company,
                    as: "company"
                },
            ],
            where: {
                id: code,
            },
        });
        if (selectAssetByCodeData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectAssetByCodeData,
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
controller.updateAsset = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const username = req.body.username_POST
        var code = req.body.code_POST
        var assetType = req.body.asset_type_POST
        var assetSubType = req.body.asset_sub_type_POST
        var note = req.body.note_POST
        var valueMonth = req.body.value_monthly_POST
        var periodMonth = req.body.period_months_POST
        var location = req.body.location_POST
        var leasing = req.body.leasing_POST
        var paymentRef = req.body.payment_ref_POST
        let updateAssetData = await model.fat_asset.update(
            {
                code_asset_type: assetType,
                code_asset_subtype: assetSubType,
                note: note,
                payment_ref: paymentRef,
                depreciation_value_monthly: valueMonth,
                depreciation_period_months: periodMonth,
                leasing_status: leasing,
                asset_location: location,
            },
            {
                where:
                {
                    id: code
                },
                transaction: transaction
            },
        );
        if (updateAssetData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: "updatePurchaseOrderData",
            });
            logger.info('Update Asset', {
                "1.username": `${username}`,
                "2.module": 'updateAsset',
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
        // }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error,
        });
    }
}
controller.postingAsset = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var code = req.body.code_POST
        var username = req.body.username_POST
        var selectAssetDataID = await model.fat_asset.findAll({
            include: [
                {
                    model: model.adm_company,
                    as: "company"
                },
            ],
            where:
            {
                id: code
            },
            transaction: transaction
        });
        if (selectAssetDataID.length > 0) {
            selectAsset(selectAssetDataID)
        } else {
            await transaction.rollback()
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectAsset(selectAssetDataID) {
            var assetSubType = selectAssetDataID[0]["code_asset_subtype"]
            if (assetSubType === null) {
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.postingCorrect,
                });
                return false
            }
            var company = selectAssetDataID[0]["company"]["parent_code"]
            var codeTemp = company + "-" + assetSubType
            var selectAssetData = await model.fat_asset.findAll({
                where: {
                    asset_code: {
                        [Sequelize.Op.like]: codeTemp + '%'
                    }
                },
                transaction: transaction
            });
            if (selectAssetData.length > 0) {
                var idsubstring = []
                var idsubstringPush = []
                var idsubstringMax
                for (var i = 0; i < selectAssetData.length; i++) {
                    idsubstring = selectAssetData[i]['asset_code'].split("-")[1];
                    lastSegment = idsubstring.slice(-6);
                    idsubstringPush.push(lastSegment);
                    idsubstringMax = Math.max.apply(null, idsubstringPush)
                }
                var endsubstringCodeInt = parseInt(idsubstringMax) + 1
                let noUrut = (endsubstringCodeInt.toString()).padStart(6, "0")
                newCode = codeTemp + noUrut
                updateAsset(newCode)
            } else {
                no = "1"
                let noUrut = no.padStart(6, "0")
                newCode = codeTemp + noUrut
                updateAsset(newCode)
            }
        }
        async function updateAsset(newCode) {
            let updateAssetData = await model.fat_asset.update(
                {
                    asset_code: newCode,
                    status: 1,
                },
                {
                    where:
                    {
                        id: code
                    },
                    transaction: transaction
                },
            );
            if (updateAssetData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.postingData,
                });
                logger.info('Posting Asset', {
                    "1.username": `${username}`,
                    "2.module": 'postingAsset',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback()
                res.status(200).json({
                    message: " Tidak ada data",
                    data: [],
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
controller.updateAssetStatus = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var code = req.body.code_POST
        var username = req.body.username_POST
        var status = req.body.status_POST
        let updateAssetStatusData = await model.fat_asset.update(
            {
                status: status,
            },
            {
                where:
                {
                    id: code
                },
                transaction: transaction
            },
        );
        if (updateAssetStatusData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: "updatePurchaseOrderData",
            });
            logger.info('Update Asset Status', {
                "1.username": `${username}`,
                "2.module": 'updateAssetStatus',
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
        // }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error,
        });
    }
}
controller.selectAssetByWorksite = async function (req, res) {
    try {
        var language = req.body.language_POST
        var worksite = req.body.worksite_POST
        let selectAssetByWorksiteData = await model.fat_asset.findAll({
            include: [
                {
                    model: model.log_item_master,
                },
                {
                    model: model.adm_company,
                    as: "company"
                },
            ],
            where: {
                asset_location: worksite,
            },
        });
        if (selectAssetByWorksiteData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectAssetByWorksiteData,
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
controller.selectAssetDepreciation = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            worksite_POST: worksite,
            transaction_POST: TypeTransaction,
            period_POST: period,
        } = requestData;
        const selectPreClosingPeriodData = await selectPreClosingPeriod()
        if (selectPreClosingPeriodData.length > 0) {
            return sendFailedResponse(messages[language]?.deprecationFailed);
        }
        const selectAssetNullData = await selectAssetNull()
        if (selectAssetNullData.length > 0) {
            return sendFailedResponse(messages[language]?.assetNotProcess);
        }
        const selectAssetData = await selectAsset()
        if (selectAssetData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }
        sendSuccessResponse(messages[language]?.successfulData, selectAssetData);
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
        async function selectPreClosingPeriod() {
            return await model.fat_pre_closing_period.findAll({
                where: {
                    [Op.and]:
                        [
                            {
                                code_pre_closing_period: TypeTransaction
                            },
                            {
                                code_company: worksite
                            },
                            {
                                period: period
                            }
                        ]
                },
            });
        }
        async function selectAssetNull() {
            return await model.fat_asset.findAll({
                include: [
                    {
                        model: model.log_item_master,
                    },
                    {
                        model: model.adm_company,
                        as: "company"
                    },
                ],
                where: {
                    [Op.and]:
                        [
                            {
                                worksite: worksite,
                            },
                            {
                                asset_code: null
                            },
                        ]
                },
            });
        }
        async function selectAsset() {
            result = await model.fat_asset.findAll({
                include: [
                    {
                        model: model.fat_asset_type,
                        attributes: ["code_asset_type"],
                        include: [
                            {
                                model: model.fat_asset_type_translations,
                                attributes: ["language_code", "translation"],
                                where: {
                                    language_code: language
                                },
                            },
                        ]
                    },
                ],
                where: {
                    [Op.and]:
                        [
                            {
                                worksite: worksite,
                            },
                            literal(`depreciation_period_months >= '${period}'`)
                        ]
                },
            });
            const grouped = {};
            result.forEach(asset => {
                const code = asset.code_asset_type;
                const name = asset.fat_asset_type.fat_asset_type_translations[0].translation;
                const cost = asset.depreciation_value_monthly;

                if (!grouped[code]) {
                    grouped[code] = {
                        code_asset_type: code,
                        name: name,
                        depreciation_value_monthly: 0
                    };
                }

                grouped[code].depreciation_value_monthly += cost;
            });
            const resultDepreciation = Object.values(grouped);
            return (resultDepreciation);
        }
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}
controller.postingAssetDeprecation = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            period_POST: period,
            transaction_POST: typeTransaction,
            worksite_POST: worksite,
            company_code_POST: code_company,
            detail
        } = requestData;
        const selectAssetTypeData = await selectAssetType()
        if (selectAssetTypeData.length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        await processJournalEntries()
        await updateBalanceMonthly()
        const insertPreClosingPeriodData = await insertPreClosingPeriod()
        if (!insertPreClosingPeriodData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData + " insertPreClosingPeriodData");
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.postingData);
        logAction('success');

        async function selectAssetType() {
            var codeList = [];
            for (var i = 0; i < detail.length; i++)
                codeList.push(detail[i]["code_asset_type_POST"]);
            return await model.fat_asset_type.findAll({
                attributes: ["code_asset_type", "code_coa_depreciation", "code_coa_accumulated"],
                where: {
                    code_asset_type: codeList,
                },
            });
        }
        async function processJournalEntries() {
            const journalCode = await generateJournalCode();
            const resultCredit = await createCreditJournalEntry(journalCode, selectAssetTypeData, detail);
            const resultDebit = await createDebitJournalEntry(journalCode, selectAssetTypeData, detail, resultCredit);
        }
        async function generateJournalCode() {
            const endDate = eppsLib.getLastDateOfMonth(period);
            const date = new Date(endDate);
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
        async function createCreditJournalEntry(journalCode, selectAssetTypeData, detail) {
            const endDate = eppsLib.getLastDateOfMonth(period);
            const resultDeprecation = selectAssetTypeData.map(assetInstance => {
                const asset = assetInstance.toJSON(); // sama seperti get({ plain: true })
                const match = detail.find(d => d.code_asset_type_POST === asset.code_asset_type);
                return {
                    ...asset,
                    total_historical_cost: match ? match.total_historical_cost_POST : 0
                };
            });
            const creaditEntries = resultDeprecation.map((entry, index) => ({
                code_journal: journalCode,
                code_company,
                worksite,
                code_coa: entry.code_coa_accumulated,
                sequence_number: index + 1,
                description: `${typeTransaction} ${period}`,
                dk_code: "C",
                amount: entry.total_historical_cost,
                reference_code: `${typeTransaction} ${period}`,
                code_partners: "",
                code_item: 0,
                date: endDate
            }));
            const dataCredit = await model.fat_journal.bulkCreate(creaditEntries, { transaction });
            results = dataCredit
            return results;
        }
        async function createDebitJournalEntry(journalCode, selectAssetTypeData, detail, resultCredit) {
            const endDate = eppsLib.getLastDateOfMonth(period);
            const resultDeprecation = selectAssetTypeData.map(assetInstance => {
                const asset = assetInstance.toJSON(); // sama seperti get({ plain: true })
                const match = detail.find(d => d.code_asset_type_POST === asset.code_asset_type);
                return {
                    ...asset,
                    total_historical_cost: match ? match.total_historical_cost_POST : 0
                };
            });
            const lastCreditSequence = resultCredit.length > 0 ? resultCredit[resultCredit.length - 1].sequence_number : 0;
            let sequenceOffset = lastCreditSequence + 1;
            const debitEntries = resultDeprecation.map((entry, index) => ({
                code_journal: journalCode,
                code_company,
                worksite,
                code_coa: entry.code_coa_depreciation,
                sequence_number: sequenceOffset + index,
                description: `${typeTransaction} ${period}`,
                dk_code: "D",
                amount: entry.total_historical_cost,
                reference_code: `${typeTransaction} ${period}`,
                code_partners: "",
                code_item: 0,
                date: endDate
            }));

            const dataDedit = await model.fat_journal.bulkCreate(debitEntries, { transaction });
            results = dataDedit
            return results;
        }
        async function updateBalanceMonthly() {

            const journalEntries = await model.fat_journal.findAll({
                where: { reference_code: `${typeTransaction} ${period}` },
                transaction
            });
            for (const entry of journalEntries) {
                const existingBalance = await model.fat_balance_monthly.findOne({
                    where: {
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: period,
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
                    var updateResult = await model.fat_balance_monthly.update(updateData, {
                        where: {
                            code_company,
                            worksite,
                            code_coa: entry.code_coa,
                            period_date: period
                        },
                        transaction
                    });
                } else {
                    var createdRecord = await model.fat_balance_monthly.create({
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: period,
                        opening_balance: 0,
                        debit: entry.dk_code === "D" ? amount : 0,
                        credit: entry.dk_code === "C" ? amount : 0,
                        status: 0
                    }, { transaction });
                }
            }
        }
        async function insertPreClosingPeriod() {
            return await model.fat_pre_closing_period.create({
                code_pre_closing_period: typeTransaction,
                code_company: worksite,
                period,
            }, { transaction });
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
            logger.info(`Posting Asset Deprecation`, {
                "1.username": username,
                "2.module": "postingAssetDeprecation",
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