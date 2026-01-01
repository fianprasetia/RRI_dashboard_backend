const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")

controller.selectPosting = async function (req, res) {
    try {
        const language = req.body.language_POST
        let selectPostingData = await model.adm_posting.findAll({
            include: [
                {
                    model: model.hrd_employee,
                    attributes: ["fullname", "id_job_title", "worksite"],
                    include: [
                        {
                            model: model.hrd_job_title,
                            attributes: ["id_job_title"],
                            include:
                            {
                                model: model.hrd_job_title_translations,
                                attributes: ["language_code", "translation"],
                                where:
                                {
                                    language_code: language
                                },
                            }
                        },
                        {
                            model: model.adm_company,
                            as: "WorksiteCompany", // Alias untuk worksite
                            attributes: ["name"], // Menambahkan atribut worksite
                        },
                    ],
                    as: "employee"
                },
                {
                    model: model.adm_posting_type,
                    attributes: ["type_posting"],
                    include:
                    {
                        model: model.adm_posting_type_translations,
                        attributes: ["language_code", "translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                }
            ],
            order: [
                ['employee_id', 'ASC'],
                ['type_posting', 'ASC'],
            ],
        });
        if (selectPostingData.length > 0) {
            res.status(200).json({
                access: "success",
                message: "Update data success",
                data: selectPostingData,
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
controller.selectPostingByCode = async function (req, res) {
    try {
        var language = req.body.language_POST
        var id = req.body.posting_code_POST
        let selectPostingByCodeData = await model.adm_posting.findAll({
            include:
                [
                    {
                        model: model.adm_posting_type,
                        include: {
                            model: model.adm_posting_type_translations,
                            attributes: ["language_code", "translation"],
                            where: {
                                language_code: language
                            },
                        }
                    },
                ],
            where: { id_posting: id },
        });
        if (selectPostingByCodeData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectPostingByCodeData,
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
controller.insertPosting = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        const username = req.body.username_POST
        const type = req.body.type_POST
        const employee = req.body.employeeID_POST
        const status = req.body.status_POST
        var selectPostingData = await model.adm_posting.findAll({
            where:
            {
                [Op.and]: [{ employee_id: employee }, { type_posting: type }]
            },
        }
        );
        if (selectPostingData.length > 0) {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.duplicateData,
            });
        } else {
            insertPosting()
        }
        async function insertPosting() {
            var insertPostingData = await model.adm_posting.create(
                {
                    employee_id: employee,
                    type_posting: type,
                    status: status,
                },
                {
                    transaction: transaction
                }
            );

            if (insertPostingData) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertPostingData,
                });
                logger.info('Insert Posting', {
                    "1.username": `${username}`,
                    "2.module": 'insertPosting',
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
controller.updatePosting = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        const type = req.body.type_POST
        const employee = req.body.employeeID_POST
        const status = req.body.status_POST
        const id = req.body.posting_id_POST
        // var selectPostingData = await model.adm_posting.findAll({
        //     where:
        //     {
        //         [Op.and]: [
        //             { employee_id: employee },
        //              { type_posting: type },
        //              { status: id }
        //             ]
        //     },
        // }
        // );
        // if (selectPostingData.length > 0) {
        //     res.status(200).json({
        //         access: "failed",
        //         message: messages[language]?.duplicateData,
        //     });
        // } else {
        //     updatePosting()
        // }
        // async function updatePosting() {
        var updatePostingData = await model.adm_posting.update(
            {
                type_posting: type,
                employee_id: employee,
                status: status,
            },
            {
                where:
                {
                    id_posting: id
                },
                transaction: transaction
            },
        );
        if (updatePostingData) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: updatePostingData,
            });
        } else {
            await transaction.rollback()
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
            });
        }
        // }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error.message,
        });
    }
}
module.exports = controller;