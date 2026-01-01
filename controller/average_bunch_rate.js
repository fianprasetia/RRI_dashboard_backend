const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json, col } = require("sequelize")
const logger = require('./logger');

controller.selectAverageBunchRate = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;

        const selectAverageBunchRateData = await selectAverageBunchRate()
        if (!selectAverageBunchRateData) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.insertData, selectAverageBunchRateData);

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

        async function selectAverageBunchRate() {
            const data = await model.plt_average_bunch_rate.findAll({
                attributes: [
                    [sequelize.fn('DISTINCT', sequelize.col('division')), 'division'],
                    'period'
                ],
                include: [
                    {
                        model: model.adm_company,
                        attributes: ["name"]
                    },
                ],
                raw: true,
                order: [
                    ['period', 'DESC'],
                    ['division', 'ASC'],
                ],
            });
            return data;
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
}
controller.selectAverageBunchRateByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            period_POST: period,
            division_POST: division,
        } = requestData;
        const targetDate = new Date(`${period}-01`);
        targetDate.setMonth(targetDate.getMonth() - 1);

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, "0");
        const targetMonth = `${year}-${month}`
        const selectAverageBunchRateByCodeData = await selectAverageBunchRateByCode()
        if (selectAverageBunchRateByCodeData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectAverageBunchRateByCodeData);
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

        async function selectAverageBunchRateByCode() {
            let periodNow = await model.plt_average_bunch_rate.findAll({
                attributes: ["block", "average_bunch_rate", "division", "period", "estate"],
                where: {
                    [Op.and]: [
                        {
                            division
                        },
                        {
                            period
                        },
                    ]
                },
                order: [
                    ['block', 'ASC'],
                ]
            });
            let periodBefore = await model.plt_average_bunch_rate.findAll({
                attributes: ["block", "average_bunch_rate"],
                where: {
                    [Op.and]: [
                        {
                            division
                        },
                        {
                            period: targetMonth
                        },
                    ]
                },
                order: [
                    ['block', 'ASC'],
                ]
            });
            return { periodNow, periodBefore }
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
}
controller.selectAverageBunchRateByProduction = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            estate_POST: estate,
            divisi_POST: divisi,
            period_date_POST: periodDate,
        } = requestData;
        const targetDate = new Date(`${periodDate}-01`);
        targetDate.setMonth(targetDate.getMonth() - 1);

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, "0");
        const targetMonth = `${year}-${month}`

        const selectEstateActivityData = await selectEstateActivity()
        if (selectEstateActivityData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }
        const selectEstateActivityDetailData = await selectEstateActivityDetail(selectEstateActivityData)
        if (selectEstateActivityData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }
        const selectAverageBunchRateData = await selectAverageBunchRate()
        if (selectAverageBunchRateData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }
        const selectBlockData = await selectBlock(selectEstateActivityDetailData, selectAverageBunchRateData)
        if (selectBlockData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }
        sendSuccessResponse(messages[language]?.successfulData, selectBlockData);
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
        async function selectEstateActivity() {
            return await model.plt_estate_activity.findAll({
                attributes: ["transaction_no"],
                where:
                {
                    [Op.and]: [
                        {
                            code_company: estate
                        },
                        {
                            transaction_type: "PNN"
                        },
                        sequelize.where(
                            sequelize.cast(col('date'), 'text'),
                            { [Op.like]: `${targetMonth}%` }
                        )
                    ]
                },
                order: [
                    ['transaction_no', 'ASC'],
                ],
            });
        }
        async function selectEstateActivityDetail(selectEstateActivityData) {
            const results = [];
            for (const item of selectEstateActivityData) {
                const data = await model.plt_estate_activity_detail.findAll({
                    attributes: ["code_company", "work_result", "work_result_kg"],
                    where: {
                        [Op.and]: [
                            { transaction_no: item.transaction_no },
                            { code_company: { [Op.like]: `${divisi}%` } }
                        ]
                    },
                    order: [["transaction_no", "ASC"]]
                });
                const grouped = {};
                data.forEach(d => {
                    if (!grouped[d.code_company]) {
                        grouped[d.code_company] = { work_result: 0, work_result_kg: 0 };
                    }
                    grouped[d.code_company].work_result += d.work_result;
                    grouped[d.code_company].work_result_kg += d.work_result_kg;
                });

                const result = Object.entries(grouped).map(([code_company, val]) => {
                    const ratio = val.work_result > 0 ? val.work_result_kg / val.work_result : 0;
                    return {
                        code_company,
                        bjr: parseFloat(ratio.toFixed(2))
                    };
                });

                results.push(...result);
            }
            const finalGrouped = {};
            results.forEach(r => {
                if (!finalGrouped[r.code_company]) {
                    finalGrouped[r.code_company] = { totalBjr: 0, count: 0 };
                }
                finalGrouped[r.code_company].totalBjr += r.bjr;
                finalGrouped[r.code_company].count += 1;
            });

            const finalResult = Object.entries(finalGrouped).map(([code_company, val]) => {
                return {
                    code_company,
                    bjr: parseFloat((val.totalBjr / val.count).toFixed(2)) // rata2
                };
            });

            return finalResult;
        }
        async function selectAverageBunchRate() {
            return await model.plt_average_bunch_rate.findAll({
                attributes: ["block", "average_bunch_rate"],
                where:
                {
                    [Op.and]: [
                        {
                            block: { [Op.like]: `${divisi}%` }
                        },
                        {
                            period: targetMonth
                        },
                    ]
                },
            });
        }
        async function selectBlock(selectEstateActivityDetailData, selectAverageBunchRateData) {
            async function getBlocksWithDefault(excluded, defaultField, defaultValue) {
                const blocks = await model.adm_company.findAll({
                    attributes: ["code_company"],
                    where: {
                        [Op.and]: [
                            { parent_code: divisi },
                            { code_company_type: "Block" },
                            { code_company: { [Op.notIn]: excluded } }
                        ]
                    },
                    order: [["code_company", "ASC"]],
                });

                return blocks.map(b => ({
                    code_company: b.code_company,
                    [defaultField]: defaultValue
                }));
            }

            // === untuk Activity ===
            const excludeActivity = selectEstateActivityDetailData.map(i => i.code_company);
            const blocksActivity = await getBlocksWithDefault(excludeActivity, "bjr", 0);
            const finalResultActivity = [...selectEstateActivityDetailData, ...blocksActivity]
                .sort((a, b) => a.code_company.localeCompare(b.code_company));

            // === untuk Average ===
            const excludeAverage = selectAverageBunchRateData.map(i => i.block);
            const blocksAverage = await getBlocksWithDefault(excludeAverage, "average_bunch_rate", 0);
            const finalResultAverage = [...selectAverageBunchRateData, ...blocksAverage]
                .sort((a, b) => a.block.localeCompare(b.block));

            return { finalResultActivity, finalResultAverage };
        }

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
}
controller.insertAverageBunchRate = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            estate_POST: estate,
            division_POST: division,
            period_date_POST: period,
            detail: details
        } = requestData;

        const isDuplicate = await checkDuplicateAverageBunchRate();
        if (isDuplicate) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.duplicateData);
        }
        const insertAverageBunchRateData = await insertAverageBunchRate();
        if (!insertAverageBunchRateData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');


        async function checkDuplicateAverageBunchRate() {
            const existing = await model.plt_average_bunch_rate.findOne({
                where: {
                    [Op.and]: [
                        {
                            block: { [Op.like]: `${division}%` }
                        },
                        {
                            period: period
                        }
                    ]
                },
                transaction
            });
            return !!existing;
        }

        async function insertAverageBunchRate() {
            const detailRecords = details.map((item, index) => {
                return {
                    period,
                    average_bunch_rate: item.bjr_POST,
                    division,
                    estate,
                    block: item.block_POST,
                };
            });
            return await model.plt_average_bunch_rate.bulkCreate(
                detailRecords,
                { transaction }
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
            logger.info(`Insert Average Bunch Rate`, {
                "1.username": username,
                "2.module": "insertAverageBunchRate",
                "3.status": status,
                "4.action": req.body
            });
        }
    } catch (error) {
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.error('Rollback error:', rollbackError);
        }

        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
        logAction('failed');
    }


};
controller.updateAverageBunchRate = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            estate_POST: estate,
            division_POST: division,
            period_date_POST: period,
            detail: details
        } = requestData;


        await deleteAverageBunchRate();
        const updateAverageBunchRateData = await updateAverageBunchRate();
        if (!updateAverageBunchRateData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData);
        logAction('success');

        async function deleteAverageBunchRate() {
            await model.plt_average_bunch_rate.destroy({
                where: {
                    [Op.and]: [
                        {
                            division
                        },
                        {
                            period
                        },
                    ]
                },
                transaction
            });
        };
        async function updateAverageBunchRate() {
            const detailRecords = details.map((item, index) => {
                return {
                    period,
                    average_bunch_rate: item.bjr_POST,
                    division,
                    estate,
                    block: item.block_POST,
                };
            });
            return await model.plt_average_bunch_rate.bulkCreate(
                detailRecords,
                { transaction }
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
            logger.info(`Update Average Bunch Rate`, {
                "1.username": username,
                "2.module": "updateAverageBunchRate",
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