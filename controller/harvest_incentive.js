const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectHarvestIncentive = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;

        const selectHarvestIncentiveData = await selectHarvestIncentive()
        if (!selectHarvestIncentiveData) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.insertData, selectHarvestIncentiveData);

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

        async function selectHarvestIncentive() {
            const data = await model.plt_harvest_incentive.findAll({
                include: [
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
                    ['harvest_day', 'ASC'],
                    ['code_company', 'ASC'],
                    ['start_bjr', 'ASC'],
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
controller.selectHarvestIncentiveByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            harvest_incentive_POST: codeHarvestIncentive,
        } = requestData;

        const selectHarvestIncentiveByCodeData = await selectHarvestIncentiveByCode()
        if (selectHarvestIncentiveByCodeData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectHarvestIncentiveByCodeData);
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

        async function selectHarvestIncentiveByCode() {
            return await model.plt_harvest_incentive.findAll({
                where: {
                    id: codeHarvestIncentive
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
controller.insertHarvestIncentive = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            username_POST: username,
            employee_id_POST: employeeID,
            company_POST: company,
            harvest_day_POST: harvestDay,
            startBJR_POST: startBJR,
            endBJR_POST: endBJR,
            harvestBasis_POST: harvestBasis,
            harvestBasis_I_POST: harvestBasisI,
            harvestBasis_II_POST: harvestBasisII,
            basis_bonus_POST: basisBonus,
            extra_basis_bonus_POST: extraBasisBonus,
            extra_basis_bonus_I_POST: extraBasisBonusI,
            extra_basis_bonus_II_POST: extraBasisBonusII,
            loose_fruit_bonus_POST: looseFruitBonus,
        } = requestData;

        const isDuplicate = await checkDuplicateHarvestIncentive();
        if (isDuplicate) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.duplicateData);
        }
        const insertHarvestIncentiveData = await insertHarvestIncentive();
        if (!insertHarvestIncentiveData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');


        async function checkDuplicateHarvestIncentive() {
            const existing = await model.plt_harvest_incentive.findOne({
                where: {
                    [Op.and]: [
                        {
                            code_company: company
                        },
                        {
                            harvest_day: harvestDay
                        }
                    ]
                },
                transaction
            });
            return !!existing;
        }

        async function insertHarvestIncentive() {
            return await model.plt_harvest_incentive.create({
                code_company: company,
                harvest_day: harvestDay,
                start_bjr: startBJR,
                end_bjr: endBJR,
                harvest_basis_ffb: harvestBasis,
                harvest_basis_i_ffb: harvestBasisI,
                harvest_basis_ii_ffb: harvestBasisII,
                basis_bonus: basisBonus,
                extra_basis_bonus: extraBasisBonus,
                extra_basis_bonus_i: extraBasisBonusI,
                extra_basis_bonus_ii: extraBasisBonusII,
                loose_fruit_bonus: looseFruitBonus,
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
            logger.info(`Insert Harvest Incentive`, {
                "1.username": username,
                "2.module": "insertHarvestIncentive",
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
controller.updateHarvestIncentive = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            username_POST: username,
            employee_id_POST: employeeID,
            harvest_incentive_POST: code,
            startBJR_POST: startBJR,
            endBJR_POST: endBJR,
            harvestBasis_POST: harvestBasis,
            harvestBasis_I_POST: harvestBasisI,
            harvestBasis_II_POST: harvestBasisII,
            basis_bonus_POST: basisBonus,
            extra_basis_bonus_POST: extraBasisBonus,
            extra_basis_bonus_I_POST: extraBasisBonusI,
            extra_basis_bonus_II_POST: extraBasisBonusII,
            loose_fruit_bonus_POST: looseFruitBonus,
        } = requestData;

        const updateHarvestIncentiveData = await updateHarvestIncentive()
        if (!updateHarvestIncentiveData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData, updateHarvestIncentiveData);
        logAction('success');

        async function updateHarvestIncentive() {
            return await model.plt_harvest_incentive.update(
                {
                    start_bjr: startBJR,
                    end_bjr: endBJR,
                    harvest_basis_ffb: harvestBasis,
                    harvest_basis_i_ffb: harvestBasisI,
                    harvest_basis_ii_ffb: harvestBasisII,
                    basis_bonus: basisBonus,
                    extra_basis_bonus: extraBasisBonus,
                    extra_basis_bonus_i: extraBasisBonusI,
                    extra_basis_bonus_ii: extraBasisBonusII,
                    loose_fruit_bonus: looseFruitBonus,
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
            logger.info(`Update Harvest Incentive`, {
                "1.username": username,
                "2.module": "updateHarvestIncentive",
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