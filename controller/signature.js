const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectSignature = async function (req, res) {
    try {
        let selectSignatureData = await model.adm_signature.findAll({
            include: [
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"]
                },
            ],
        });
        if (selectSignatureData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectSignatureData,
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
controller.insertSignature = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const employee = req.body.employeeID_POST
        const username = req.body.username_POST
        const status = req.body.status_POST
        let selectPartnersByCodeData = await model.adm_signature.findAll({
            where: {
                employee_id: employee
            },
        });
        if (selectPartnersByCodeData.length > 0) {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.duplicateData,
                data: [],
            });
        } else {
            insertSignature()
        }
        async function insertSignature() {
            let insertSignatureData = await model.adm_signature.create(
                {
                    employee_id: employee,
                    photo: employee + ".png",
                    status: status,
                },
                {
                    transaction: transaction
                }
            );
            if (insertSignatureData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertSignatureData,
                });
                logger.info('Insert Signature', {
                    "1.username": `${username}`,
                    "2.module": 'insertSignature',
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
        }

    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error,
        });
    }
}

controller.selectSignatureByCode = async function (req, res) {
    try {
        const code = req.body.employeeID_POST
        let selectSignatureByCodeData = await model.adm_signature.findAll({
            where: {
                employee_id: code
            },
        });
        if (selectSignatureByCodeData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectSignatureByCodeData,
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
controller.updateSignature = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const username = req.body.username_POST
        const employee = req.body.employeeID_POST
        const status = req.body.status_POST
        let updateSignatureData = await model.adm_signature.update(
            {
                status: status,
            },
            {
                where:
                {
                    employee_id: employee
                },
                transaction: transaction
            },
        );
        if (updateSignatureData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: updateSignatureData,
            });
            logger.info('Update Signature', {
                "1.username": `${username}`,
                "2.module": 'updateSignature',
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