const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json, col } = require("sequelize")
const logger = require('./logger');

controller.selectHoliday = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;

        const selectHolidayData = await selectHoliday()
        if (selectHolidayData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }


        sendSuccessResponse(messages[language]?.insertData, selectHolidayData);

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
        async function selectHoliday() {
            return await model.hrd_holiday.findAll({
                attributes: [
                    [sequelize.fn('DISTINCT', sequelize.col('period')), 'period'],

                ],
                order: [
                    ["period", "DESC"]
                ]
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
controller.selectHolidayByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            period_date_POST: period,
        } = requestData;

        const selectHolidayByCodeData = await selectHolidayByCode()
        if (selectHolidayByCodeData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectHolidayByCodeData);
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

        async function selectHolidayByCode() {
            return await model.hrd_holiday.findAll({
                where: {
                    period
                },
                order: [
                    ['date', 'ASC']
                ],
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
controller.insertHoliday = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            period_date_POST: period,
            detail: details
        } = requestData;

        const isDuplicate = await checkDuplicateHoliday();
        if (isDuplicate) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.duplicateData);
        }
        const insertHolidayData = await insertHoliday();
        if (!insertHolidayData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');


        async function checkDuplicateHoliday() {
            const existing = await model.hrd_holiday.findOne({
                where: {
                    [Op.and]: [
                        {
                            period
                        },
                    ]
                },
                transaction
            });
            return !!existing;
        }

        async function insertHoliday() {
            const detailRecords = details.map((item, index) => {
                return {
                    period,
                    date: item.date_POST,
                    description: item.description_POST,
                    type: item.type_POST,
                };
            });
            return await model.hrd_holiday.bulkCreate(
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
            logger.info(`Insert Holiday`, {
                "1.username": username,
                "2.module": "insert Holiday",
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
controller.updateHoliday = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            period_date_POST: period,
            detail: details
        } = requestData;


        await deleteHoliday();
        const updateHolidayData = await updateHoliday();
        if (!updateHolidayData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData);
        logAction('success');

        async function deleteHoliday() {
            await model.hrd_holiday.destroy({
                where: {
                    period
                },
                transaction
            });
        };
        async function updateHoliday() {
            const detailRecords = details.map((item, index) => {
                return {
                    period,
                    date: item.date_POST,
                    description: item.description_POST,
                    type: item.type_POST,
                };
            });
            return await model.hrd_holiday.bulkCreate(
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
            logger.info(`Update Holiday`, {
                "1.username": username,
                "2.module": "updateHoliday",
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