const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectHarvestPenalty = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;

        const selectHarvestPenaltyData = await selectHarvestPenalty()
        if (!selectHarvestPenaltyData) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.insertData, selectHarvestPenaltyData);

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

        async function selectHarvestPenalty() {
            const data = await model.plt_harvest_penalty.findAll({
                include: [
                    {
                        model: model.plt_harvest_penalty_type,
                        include: [
                            {
                                model: model.plt_harvest_penalty_type_translations,
                                attributes: ["language_code", "translation"],
                                where: {
                                    language_code: language
                                },
                                as: 'translations'
                            }
                        ]
                    },
                    {
                        model: model.adm_company,
                        attributes: ["name"],
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                    }
                ],
                order: [
                    ['code_harvest_penalty', 'ASC'],
                    ['code_company', 'ASC'],
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
controller.selectHarvestPenaltyByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            harvest_penalty_POST: codeHarvestPenalty,
        } = requestData;

        const selectHarvestPenaltyByCodeData = await selectHarvestPenaltyByCode()
        if (selectHarvestPenaltyByCodeData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectHarvestPenaltyByCodeData);
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

        async function selectHarvestPenaltyByCode() {
            return await model.plt_harvest_penalty.findAll({
                include: [
                    {
                        model: model.plt_harvest_penalty_type,
                        include: [
                            {
                                model: model.plt_harvest_penalty_type_translations,
                                attributes: ["language_code", "translation"],
                                where: {
                                    language_code: language
                                },
                                as: 'translations'
                            }
                        ]
                    },
                    {
                        model: model.adm_company,
                        attributes: ["name"],
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                    }
                ],
                where: {
                    id: codeHarvestPenalty
                },
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
controller.insertHarvestPenalty = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            username_POST: username,
            employee_id_POST: employeeID,
            estate_POST: estate,
            harvest_penalty_type_POST: harvestPenaltyType,
            uom_POST: uom,
            nominal_POST: nominal,
            note_POST: note,
        } = requestData;

        const isDuplicate = await checkDuplicateHarvestPenalty();
        if (isDuplicate) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.duplicateData);
        }
        const insertHarvestPenaltyData = await insertHarvestPenalty();
        if (!insertHarvestPenaltyData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');


        async function checkDuplicateHarvestPenalty() {
            const existing = await model.plt_harvest_penalty.findOne({
                where: {
                    [Op.and]: [
                        {
                            code_harvest_penalty: harvestPenaltyType
                        },
                        {
                            code_company: estate
                        }
                    ]
                },
                transaction
            });
            return !!existing;
        }

        async function insertHarvestPenalty() {
            return await model.plt_harvest_penalty.create({
                code_harvest_penalty: harvestPenaltyType,
                code_company: estate,
                uom,
                nominal,
                note,
                create_by: employeeID,
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
            logger.info(`Insert Harvest Penalty`, {
                "1.username": username,
                "2.module": "insertHarvestPenalty",
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
controller.updateHarvestPenalty = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            username_POST: username,
            employee_id_POST: employeeID,
            harvest_penalty_POST: code,
            uom_POST: uom,
            nominal_POST: nominal,
            note_POST: note,
        } = requestData;

        const updateHarvestPenaltyData = await updateHarvestPenalty()
        if (!updateHarvestPenaltyData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData, updateHarvestPenaltyData);
        logAction('success');

        async function updateHarvestPenalty() {
            return await model.plt_harvest_penalty.update(
                {
                    uom,
                    nominal,
                    note,
                    create_by: employeeID,
                },
                {
                    where:
                    {
                        id: code,
                    },
                    transaction,
                },
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
            logger.info(`Update Harvest Penalty`, {
                "1.username": username,
                "2.module": "updateHarvestPenalty",
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
controller.selectHarvestPenaltyByHarvest = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            company_POST: companyCode,
        } = requestData;

        const selectHarvestPenaltyData = await selectHarvestPenalty()
        if (selectHarvestPenaltyData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectHarvestPenaltyData);
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

        async function selectHarvestPenalty() {
            return await model.plt_harvest_penalty.findAll({
                include: [
                    {
                        model: model.plt_harvest_penalty_type,
                        attributes: ["code_harvest_penalty"],
                        include: [
                            {
                                model: model.plt_harvest_penalty_type_translations,
                                attributes: ["language_code", "translation"],
                                where: {
                                    language_code: language
                                },
                                as: 'translations'
                            }
                        ]
                    },
                ],  
                attributes: ["code_harvest_penalty", "nominal" ,"uom"],
                where: {
                    code_company: companyCode
                },
                order: [
                    ["code_harvest_penalty", "ASC"]
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
module.exports = controller;