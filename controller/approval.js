const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectApproval = async function (req, res) {
    try {
        let selectApprovalData = await model.adm_approval.findAll({
            // include: {
            //     model: model.adm,
            //     attributes: ["language_code", "translation"],
            // },
            order: [
                ['code_company', 'ASC'],
                ['type_approval', 'ASC'],
                ['level_approval', 'ASC'],
            ],
        });
        if (selectApprovalData.length > 0) {
            res.json({
                access: "success",
                message: "Update data success",
                data: selectApprovalData,
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
controller.selectApprovalByLanguage = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectApprovalLanguageData = await model.adm_approval.findAll({
            include:
                [
                    {
                        model: model.adm_approval_type,
                        include: {
                            model: model.adm_approval_type_translations,
                            attributes: ["language_code", "translation"],
                            where: {
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
            order: [
                ['code_company', 'ASC'],
                ['type_approval', 'ASC'],
                ['level_approval', 'ASC'],
            ],
        });
        if (selectApprovalLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectApprovalLanguageData,
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
controller.selectApprovalByCompanyType = async function (req, res) {
    try {
        var language = req.body.language_POST
        var type = req.body.approvalType_POST
        var worksite = req.body.companyCode_POST
        let selectApprovalLanguageData = await model.adm_approval.findAll({
            include:
                [
                    {
                        model: model.adm_approval_type,
                        include: {
                            model: model.adm_approval_type_translations,
                            attributes: ["language_code", "translation"],
                            where: {
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
            where:
            {
                [Op.and]: [{ type_approval: type }, { code_company: worksite }]
            },
            order: [
                ['code_company', 'ASC'],
                ['type_approval', 'ASC'],
                ['level_approval', 'ASC'],
            ],
        });
        if (selectApprovalLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectApprovalLanguageData,
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
controller.insertApproval = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0]["language_POST"]
        var username = req.body[0]["username_POST"]
        type = req.body[0]["dataApproval"][0].approvalType_POST
        worksite = req.body[0]["dataApproval"][0].worksite_POST
        var selectApprovalData = await model.adm_approval.findAll({
            where:
            {
                [Op.and]: [{ type_approval: type }, { code_company: worksite }]
            },
            transaction: transaction
        }
        );
        if (selectApprovalData.length > 0) {
            await transaction.rollback()
            res.status(200).json({
                access: "failed",
                message: messages[language]?.duplicateData,
            });
        } else {
            createApproval()
        }
        async function createApproval() {
            jmlData = req.body[0]["dataApproval"]
            var dataApproval = []
            for (var i = 0; i < jmlData.length; i++) {
                typeApproval = JSON.parse('{"type_approval": "' + req.body[0]["dataApproval"][i].approvalType_POST + '"}')
                codeCompany = JSON.parse('{"code_company": "' + req.body[0]["dataApproval"][i].worksite_POST + '"}')
                employeeID = JSON.parse('{"employee_id": ' + req.body[0]["dataApproval"][i].employeeID_POST + '}')
                levelApproval = JSON.parse('{"level_approval": ' + req.body[0]["dataApproval"][i].approvalNo_POST + '}')
                extend(typeApproval, codeCompany, employeeID, levelApproval);
                dataApproval.push(typeApproval);
            }
            var insertApprovalData = await model.adm_approval.bulkCreate(
                dataApproval,
                {
                    transaction: transaction
                }
            );

            if (insertApprovalData) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertApprovalData,
                });
                logger.info('Insert Approval', {
                    "1.username": `${username}`,
                    "2.module": 'insertApproval',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }
        }
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
                data: [], // Tidak ada data yang disimpan karena duplikasi
            });
        } else {
            // Tangani error lain yang tidak terduga
            await transaction.rollback();
            res.status(404).json({
                message: error.message,
            });
        }
    }
}
controller.updateApproval = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0]["language_POST"]
        var username = req.body[0]["username_POST"]
        type = req.body[0]["dataApproval"][0].approvalType_POST
        worksite = req.body[0]["dataApproval"][0].worksite_POST
        var deleteApprovalData = await model.adm_approval.destroy(
            {
                where:
                {
                    [Op.and]: [{ type_approval: type }, { code_company: worksite }]
                },
            },
            {
                transaction: transaction
            }
        );
        if (deleteApprovalData) {
            createApproval()
        } else {
            await transaction.rollback()
            res.status(200).json({
                access: "failed",
                message: messages[language]?.duplicateData,
            });

        }
        async function createApproval() {
            jmlData = req.body[0]["dataApproval"]
            var dataApproval = []
            for (var i = 0; i < jmlData.length; i++) {
                typeApproval = JSON.parse('{"type_approval": "' + req.body[0]["dataApproval"][i].approvalType_POST + '"}')
                codeCompany = JSON.parse('{"code_company": "' + req.body[0]["dataApproval"][i].worksite_POST + '"}')
                employeeID = JSON.parse('{"employee_id": ' + req.body[0]["dataApproval"][i].employeeID_POST + '}')
                levelApproval = JSON.parse('{"level_approval": ' + req.body[0]["dataApproval"][i].approvalNo_POST + '}')
                extend(typeApproval, codeCompany, employeeID, levelApproval);
                dataApproval.push(typeApproval);
            }
            var insertApprovalData = await model.adm_approval.bulkCreate(
                dataApproval,
                {
                    transaction: transaction
                }
            );
            if (insertApprovalData) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: insertApprovalData,
                });
                logger.info('Update Approval', {
                    "1.username": `${username}`,
                    "2.module": 'updateApproval',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }
        }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error.message,
        });
    }
}
module.exports = controller;