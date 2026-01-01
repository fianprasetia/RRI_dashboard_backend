const model = require("../models/index");
const messages = require("./message");
const koneksi = require("../config/database");
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectAssignEmployee = async function (req, res) {
    var language = req.body.language_POST
    tipe = req.body.companyType_POST
    companyCode = req.body.companyCode_POST
    companyParent = req.body.companyParent_POST

    if (tipe == "Head") {
        location = { code_company: companyCode }
    } else {
        location =
        {
            code_company: {
                [Op.like]: companyCode + "%"
            }
        }
    }
    try {
        let selectAssignEmployeeData = await model.hrd_employee_assign.findAll({
            include: [
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"],
                },
                {
                    model: model.adm_company,
                    attributes: ["name"],
                },
                {
                    model: model.hrd_working_hours, as: "MondayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "TuesdayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "WednesdayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "ThursdayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "FridayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "SaturdayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "SundayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
            ], where: location
        });
        if (selectAssignEmployeeData.length > 0) {
            res.json({
                access: "success",
                data: selectAssignEmployeeData,
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
controller.selectAssignEmployeeByID = async function (req, res) {
    try {
        var language = req.body.language_POST
        var id = req.body.employeID_POST
        let selectAssignEmployeeByIDData = await model.hrd_employee_assign.findAll({
            include: [
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"],
                },
                {
                    model: model.adm_company,
                    attributes: ["name"],
                },
                {
                    model: model.hrd_working_hours, as: "MondayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "TuesdayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "WednesdayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "ThursdayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "FridayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "SaturdayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "SundayHours",
                    attributes: ["id_working_hours"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
            ],
            where: {
                employee_id: id
            }
        });
        if (selectAssignEmployeeByIDData.length > 0) {
            res.json({
                access: "success",
                data: selectAssignEmployeeByIDData,
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
controller.insertAssignEmployee = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var username = req.body.username_POST
        var name = req.body.name_POST
        var worksite = req.body.worksite_POST
        var monday = req.body.monday_POST
        var tuesday = req.body.tuesday_POST
        var wednesday = req.body.wednesday_POST
        var thursday = req.body.thursday_POST
        var friday = req.body.friday_POST
        var saturday = req.body.saturday_POST
        var sunday = req.body.sunday_POST
        let selectAssignEmployeeData = await model.hrd_employee_assign.findAll({
            where:
            {
                employee_id: name,
            },
            transaction: transaction
        });
        if (selectAssignEmployeeData.length > 0) {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.duplicateData,
            });
        } else {
            insertAssignEmployeeNew()
        }
        async function insertAssignEmployeeNew() {
            let insertAssignEmployeeData = await model.hrd_employee_assign.create(
                {
                    employee_id: name,
                    code_company: worksite,
                    monday: monday,
                    tuesday: tuesday,
                    wednesday: wednesday,
                    thursday: thursday,
                    friday: friday,
                    saturday: saturday,
                    sunday: sunday,
                },
                {
                    transaction: transaction
                }
            );
            if (insertAssignEmployeeData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertAssignEmployeeData,
                });
                logger.info('Insert Assign Employee', {
                    "1.username": `${username}`,
                    "2.module": 'insertAssignEmployee',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback();
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.duplicateData,
                    data: selectAttendanceData,
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
controller.updateAssignEmployee = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var id = req.params.id
        var language = req.body.language_POST
        var username = req.body.username_POST
        var worksite = req.body.worksite_POST
        var monday = req.body.monday_POST
        var tuesday = req.body.tuesday_POST
        var wednesday = req.body.wednesday_POST
        var thursday = req.body.thursday_POST
        var friday = req.body.friday_POST
        var saturday = req.body.saturday_POST
        var sunday = req.body.sunday_POST
        let updateAssignEmployeeData = await model.hrd_employee_assign.update(
            {
                code_company: worksite,
                monday: monday,
                tuesday: tuesday,
                wednesday: wednesday,
                thursday: thursday,
                friday: friday,
                saturday: saturday,
                sunday: sunday,
            },
            {
                where:
                {
                    employee_id: id
                },
                transaction: transaction
            },
        );
        if (updateAssignEmployeeData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: updateAssignEmployeeData,
            });
            logger.info('Update Assign Employee', {
                "1.username": `${username}`,
                "2.module": 'updateAssignEmployee',
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