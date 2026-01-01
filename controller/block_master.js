const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectBlockMaster = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;


        const selectBlockMasterData = await selectBlockMaster()
        if (selectBlockMasterData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        await sendSuccessResponse(messages[language]?.successfulData, selectBlockMasterData);

        async function selectBlockMaster() {
            return await model.plt_block_master.findAll({
                include: [
                    {
                        model: model.adm_activity_type,
                        attributes: ["code_activity_type"],
                        include:
                        {
                            model: model.adm_activity_type_translations,
                            attributes: ["language_code", "translation"],
                            where:
                            {
                                language_code: language
                            },
                        }
                    },
                    {
                        model: model.adm_company,
                        attributes: ["name"]
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"]
                    },
                ],
                order: ["code_company"]
            });
        }
        async function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data && { data })
            });
        }
        async function sendFailedResponse(message) {
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
};
controller.insertBlockMaster = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            block_POST: block,
            planting_year_POST: plantingYear,
            tree_class_POST: treeClass,
            planted_area_POST: plantedArea,
            unplanted_area_POST: unplantedArea,
            number_of_trees_POST: numberOfTrees,
            block_status_POST: blockStatus,
            start_harvest_POST: startHarvest,
            soil_code_POST: soilCode,
            soil_classification_POST: soilClassification,
            topography_POST: topography,
            nucleus_plasma_POST: nucleusPlasma,
            seed_type_POST: seedType,
            username_POST: username,
            employee_id_POST: employeeID,
        } = requestData;


        const selectBlockMasterData = await selectBlockMaster();
        if (selectBlockMasterData.length > 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.duplicateData);
        }
        const insertBlockMasterData = await insertBlockMaster();
        if (!insertBlockMasterData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');

        async function selectBlockMaster() {
            return await model.plt_block_master.findAll({
                where: {
                    code_company: block
                },
                transaction
            });
        }
        async function insertBlockMaster() {
            return await model.plt_block_master.create({
                code_company: block,
                planting_year: plantingYear,
                tree_class: treeClass,
                planted_area: plantedArea,
                unplanted_area: unplantedArea,
                number_of_trees: numberOfTrees,
                block_status: blockStatus,
                start_harvest: startHarvest,
                soil_code: soilCode,
                soil_classification: soilClassification,
                topography: topography,
                nucleus_plasma: nucleusPlasma,
                seed_type: seedType,
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
            logger.info(`Insert Block Master`, {
                "1.username": username,
                "2.module": "insertBlockMaster",
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
    }
};
controller.selectBlockMasterByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            code_block_POST: codeBlock,
        } = requestData;

        const selectBlockMasterByCodeData = await selectBlockMasterByCode()
        if (selectBlockMasterByCodeData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectBlockMasterByCodeData);
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

        async function selectBlockMasterByCode() {
            return await model.plt_block_master.findAll({
                include: [
                    {
                        model: model.adm_activity_type,
                        attributes: ["code_activity_type"],
                        include:
                        {
                            model: model.adm_activity_type_translations,
                            attributes: ["language_code", "translation"],
                            where:
                            {
                                language_code: language
                            },
                        }
                    },
                    {
                        model: model.adm_company,
                        attributes: ["name"]
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"]
                    },
                ],
                where: {
                    code_company: codeBlock
                }
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
controller.updateBlockMaster = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            block_POST: block,
            planting_year_POST: plantingYear,
            tree_class_POST: treeClass,
            planted_area_POST: plantedArea,
            unplanted_area_POST: unplantedArea,
            number_of_trees_POST: numberOfTrees,
            block_status_POST: blockStatus,
            start_harvest_POST: startHarvest,
            soil_code_POST: soilCode,
            soil_classification_POST: soilClassification,
            topography_POST: topography,
            nucleus_plasma_POST: nucleusPlasma,
            seed_type_POST: seedType,
            username_POST: username,
        } = requestData;

        const updateBlockMasterData = await updateBlockMaster()
        if (!updateBlockMasterData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }

        // const deletePaymentVoucherDetailData = await deletePaymentVoucherDetail()
        // if (!deletePaymentVoucherDetailData) {
        //     await transaction.rollback();
        //     return sendFailedResponse(messages[language]?.nodata);
        // }
        // const insertPaymentVoucherDetailData = await insertPaymentVoucherDetail()
        // if (!insertPaymentVoucherDetailData) {
        //     await transaction.rollback();
        //     return sendFailedResponse(messages[language]?.failedData);
        // }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData, updateBlockMasterData);
        logAction('success');

        async function updateBlockMaster() {
            return await model.plt_block_master.update(
                {
                    planting_year: plantingYear,
                    tree_class: treeClass,
                    planted_area: plantedArea,
                    unplanted_area: unplantedArea,
                    number_of_trees: numberOfTrees,
                    block_status: blockStatus,
                    start_harvest: startHarvest,
                    soil_code: soilCode,
                    soil_classification: soilClassification,
                    topography: topography,
                    nucleus_plasma: nucleusPlasma,
                    seed_type: seedType,
                },
                {
                    where:
                    {
                         code_company: block
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
            logger.info(`Update Block Master`, {
                "1.username": username,
                "2.module": "updateBlockMaster",
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