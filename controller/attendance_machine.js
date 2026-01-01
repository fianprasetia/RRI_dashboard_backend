const model = require("../models/index");
const messages = require("./message");
const koneksi = require("../config/database");
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectAttendanceMachine = async function (req, res) {
    var language = req.body.language_POST
    try {
        let selectAttendanceData = await model.adm_attendance_machine.findAll({
            include: {
                model: model.adm_company,
                attributes: ["name"],
            },
            order: [
                ['code_company', 'ASC'],
            ],
        });
        if (selectAttendanceData.length > 0) {
            res.json({
                access: "success",
                data: selectAttendanceData,
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
controller.selectAttendanceMachineByWorksite = async function (req, res) {
    try {
        var language = req.body.language_POST
        var worksite = req.body.worksite_POST
        let selectAttendanceMachineByWorksiteData = await model.adm_attendance_machine.findAll({
            include: {
                model: model.adm_company,
                attributes: ["name"],
            },
            order: [
                ['code_company', 'ASC'],
            ],
            where: {
                code_company: worksite
            }
        });
        if (selectAttendanceMachineByWorksiteData.length > 0) {
            res.json({
                access: "success",
                data: selectAttendanceMachineByWorksiteData,
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
controller.insertAttendanceMachine = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var worksite = req.body.worksite_POST
        var ipAddress = req.body.ipAddress_POST
        var port = req.body.port_POST
        var status = req.body.status_POST
        var location = req.body.location_POST
        var username = req.body.username_POST
        let selectAttendanceData = await model.adm_attendance_machine.findAll(
            {
                where:
                {
                    [Op.and]: [{ ip_address: ipAddress }, { code_company: worksite }]
                },
            },
            {
                transaction: transaction
            }
        );
        if (selectAttendanceData.length > 0) {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.duplicateData,
                data: selectAttendanceData,
            });
        } else {
            insertAttendanceMachineWorksite()
        }
        async function insertAttendanceMachineWorksite() {
            let insertAttendanceMachineWorksiteData = await model.adm_attendance_machine.create(
                {
                    code_company: worksite,
                    ip_address: ipAddress,
                    port: port,
                    status: status,
                    location: location,
                },
                {
                    transaction: transaction
                }
            );
            if (insertAttendanceMachineWorksiteData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertAttendanceMachineWorksiteData,
                });
                logger.info('Insert Attendance Machine', {
                    "1.username": `${username}`,
                    "2.module": 'insertAttendanceMachine',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback();
                res.status(200).json({
                    message: messages[language]?.nodata,
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
controller.selectAttendanceMachineByID = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var id = req.body.attendanceMachine_POST
        let selectAttendanceMachineByIDData = await model.adm_attendance_machine.findAll(
            {
                include: {
                    model: model.adm_company,
                    attributes: ["name"],
                },
                where:
                {
                    id_attendance_machine: id
                },
                transaction: transaction
            },
        );

        if (selectAttendanceMachineByIDData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: selectAttendanceMachineByIDData,
            });
        } else {
            await transaction.rollback();
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
controller.updateAttendanceMachine = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var id = req.params.id
        var language = req.body.language_POST
        var worksite = req.body.worksite_POST
        var ipAddress = req.body.ipAddress_POST
        var port = req.body.port_POST
        var status = req.body.status_POST
        var location = req.body.location_POST
        var username = req.body.username_POST
        let uupdateAttendanceMachineWorksiteData = await model.adm_attendance_machine.update(
            {
                code_company: worksite,
                ip_address: ipAddress,
                port: port,
                status: status,
                location: location,
            },
            {
                where:
                {
                    id_attendance_machine: id
                },
                transaction: transaction
            },
        );
        if (uupdateAttendanceMachineWorksiteData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: uupdateAttendanceMachineWorksiteData,
            });
            logger.info('Update Attendance Machine', {
                "1.username": `${username}`,
                "2.module": 'updateAttendanceMachine',
                "3.status": 'success',
                "4.action": req.body
            });
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error,
        });
    }
}
module.exports = controller;