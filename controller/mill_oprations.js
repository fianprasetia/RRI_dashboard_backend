const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json, col } = require("sequelize")
const logger = require('./logger');

controller.selectMillOperations = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            start_date_POST: startDate,
            end_date_POST: endDate,
            mill_POST: mill,
        } = requestData;

        const selecMillOperationsData = await selecMillOperations()
        if (selecMillOperationsData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.insertData, selecMillOperationsData);

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
        async function selecMillOperations() {
            return await model.mll_operations.findAll({
                
                include: [
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
                        as: "factory"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeForeman"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeAssistant"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeCreate"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeUpdate"
                    },
                ],
                where:
                {
                    [Op.and]: [
                        { mill },
                        {
                            date: {
                                [Op.between]: [startDate, endDate]
                            },
                        },
                        {
                            status: {
                                [sequelize.Op.not]: 2
                            },
                        }
                    ]

                },
                order: [
                    ["status", "ASC"],
                    ["transaction_no", "ASC"],
                    ["date", "ASC"],
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
controller.insertMillOprations = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            employeeID_POST: employeeID,
            mill_POST: mill,
            date_POST: createDate,
            shift_POST: shift,
            start_time_POST: startTime,
            end_time_POST: endTime,
            foreman_POST: foreman,
            assistant_POST: assistant,
            timeProcess_POST: timeProcess,
            breakdown_POST: breakdown,
            Number_of_cages_POST: NumberofCages,
            processed_FFB_POST: processesFFB,
            detail: details
        } = requestData;

        const yearAndMonth = createDate.split("-").slice(0, 2).join("-");
        const formattedDate = createDate.split("-").slice(0, 2).join("");

        const isDuplicate = await checkDuplicateMillOperations();
        if (isDuplicate) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.duplicateData);
        }

        var newCode = await generateMillOprationsCode();
        const insertMillOprationsData = await insertMillOprations(newCode);
        if (!insertMillOprationsData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        if (details.length > 0) {
            const insertMillOprationsRepairData = await insertMillOprationsRepair(newCode);
            if (!insertMillOprationsRepairData) {
                await transaction.rollback();
                return sendFailedResponse(messages[language]?.failedData);
            }
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');

        async function checkDuplicateMillOperations() {
            const existing = await model.mll_operations.findOne({
                where: {
                    [Op.and]: [
                        {
                            mill
                        },
                        {
                            date: createDate
                        }
                    ]
                },
                transaction
            });
            return !!existing;
        }
        async function generateMillOprationsCode() {
            const existingIssues = await model.mll_operations.findAll({
                where: {
                    [Op.and]: [
                        sequelize.where(
                            sequelize.fn('to_char', sequelize.col('date'), 'YYYY-MM'),
                            yearAndMonth
                        ),
                        {
                            mill
                        },
                    ]
                },
                transaction
            });
            let sequenceNumber;
            if (existingIssues.length > 0) {
                const maxCode = Math.max(
                    ...existingIssues.map(issue => parseInt(issue.transaction_no, 10))
                );
                const endDigits = String(maxCode).slice(-3);
                sequenceNumber = (parseInt(endDigits) + 1).toString().padStart(3, "0");
            } else {
                sequenceNumber = "001";
            }
            return `${sequenceNumber}/OPR-${mill.toUpperCase()}/${formattedDate}`;
        }
        async function insertMillOprations(newCode) {
            return await model.mll_operations.create({
                transaction_no: newCode,
                mill,
                date: createDate,
                work_shift: shift,
                on_duty_time: startTime,
                off_duty_time: endTime,
                foreman: foreman || null,
                assistant: assistant || null,
                total_working_hours: timeProcess || null,
                total_repair_time: breakdown || null,
                number_of_cages: NumberofCages || null,
                processed_ffb: processesFFB || null,
                created_by: employeeID,
                update_by: employeeID,
                status: 0,
            }, { transaction });
        }
        async function insertMillOprationsRepair(newCode) {
            const detailRecords = details.map((item, index) => {
                return {
                    transaction_no: newCode,
                    station: item.code_station_POST,
                    machine: item.code_machine_POST,
                    on_repair_time: item.start_repair_time_POST,
                    off_repair_time: item.end_repair_time_POST,
                    total_repair_time: item.breakdown_POST,
                    presure_start: item.start_presure_POST,
                    presure_end: item.end_presure_POST,
                    status: item.code_status_POST,
                    note: item.note_POST,
                };
            });
            return await model.mll_operations_repair.bulkCreate(
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
            logger.info(`Insert Mill Operations`, {
                "1.username": username,
                "2.module": "insertMillOprations",
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
controller.selectMillOperationsByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            code_POST: code,
        } = requestData;

        const selectMillOperationsData = await selectMillOperations()
        if (selectMillOperationsData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectMillOperationsData);
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
        async function selectMillOperations() {
            return await model.mll_operations.findAll({
                include: [
                    {
                        model: model.mll_operations_repair,
                        as: "details",
                        include: [
                            {
                                model: model.adm_company,
                                attributes: ["code_company", "name"],
                                as: "factorystation"
                            },
                            {
                                model: model.adm_company,
                                attributes: ["code_company", "name"],
                                as: "factorymachine"
                            },
                        ]
                    },
                ],
                where: { transaction_no: code }
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
controller.updateMillOperations = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            employeeID_POST: employeeID,
            mill_POST: mill,
            code_POST: code,
            date_POST: createDate,
            shift_POST: shift,
            start_time_POST: startTime,
            end_time_POST: endTime,
            foreman_POST: foreman,
            assistant_POST: assistant,
            timeProcess_POST: timeProcess,
            breakdown_POST: breakdown,
            Number_of_cages_POST: NumberofCages,
            processed_FFB_POST: processesFFB,
            detail: details
        } = requestData;


        const updateMillOperationsData = await updateMillOperations();
        if (!updateMillOperationsData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        await deleteMillOperationsRepair()


        const updateMillOperationsRepairData = await updateMillOperationsRepair();
        if (!updateMillOperationsRepairData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData);
        logAction('success');

        async function updateMillOperations() {
            return await model.mll_operations.update(
                {
                    mill,
                    date: createDate,
                    work_shift: shift,
                    on_duty_time: startTime,
                    off_duty_time: endTime,
                    foreman: foreman || null,
                    assistant: assistant || null,
                    total_working_hours: timeProcess || null,
                    total_repair_time: breakdown || null,
                    number_of_cages: NumberofCages || null,
                    processed_ffb: processesFFB || null,
                    status: 0,
                    update_by: employeeID,
                },
                {
                    where:
                    {
                        transaction_no: code,
                    },
                    transaction,
                },
            );
        }
        async function deleteMillOperationsRepair() {
            await model.mll_operations_repair.destroy({
                where: {
                    transaction_no: code,
                },
                transaction
            });
        };
        async function updateMillOperationsRepair() {
            const detailRecords = details.map((item, index) => {
                return {
                    transaction_no: code,
                    station: item.code_station_POST,
                    machine: item.code_machine_POST,
                    on_repair_time: item.start_repair_time_POST,
                    off_repair_time: item.end_repair_time_POST,
                    total_repair_time: item.breakdown_POST,
                    presure_start: item.start_presure_POST,
                    presure_end: item.end_presure_POST,
                    status: item.code_status_POST,
                    note: item.note_POST,
                };
            });
            return await model.mll_operations_repair.bulkCreate(
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
            logger.info(`Update Mill Operations`, {
                "1.username": username,
                "2.module": "updateMillOperations",
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
controller.postingMillOperations = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            code_POST: code,
            language_POST: language,
            username_POST: username,
            employeeID_POST: employee,
        } = requestData;
        
        const updateMillOperationsData = await updateMillOperations()
        if (!updateMillOperationsData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.postingCorrect);
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.postingData);
        logAction('success');

        async function updateMillOperations() {
            return await model.mll_operations.update(
                {
                    status: 1,
                    update_by: employee
                },
                {
                    where: {
                        transaction_no: code
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
            logger.info(`Posting Mill Operations`, {
                "1.username": username,
                "2.module": "updateMillOperations",
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
controller.deleteMillOperations = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            code_POST: code,
            language_POST: language,
            username_POST: username,
        } = requestData;

        const deleteMillOperationsData = await deleteMillOperations()
        if (!deleteMillOperationsData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }


        await transaction.commit();
        sendSuccessResponse(messages[language]?.deleteData, deleteMillOperationsData);
        logAction('success');

        async function deleteMillOperations() {
            return await model.mll_operations.update(
                {
                    status: 2,
                },
                {
                    where: {
                        transaction_no: code
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
            logger.info(`Delete Estate Activity`, {
                "1.username": username,
                "2.module": "deleteEstateActivity",
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