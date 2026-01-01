const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const sequelize = require("sequelize");
const controller = {}
const { Op, json } = require("sequelize")

controller.selectWorkingHours = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectWorkingHoursData = await model.hrd_working_hours.findAll({
            include: {
                model: model.hrd_working_hours_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['id_working_hours', 'ASC'],
            ],
        });
        if (selectWorkingHoursData.length > 0) {
            res.status(200).json({
                access: "success",
                // message: messages[language]?.insertData,
                data: selectWorkingHoursData,
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
controller.insertWorkingHours = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        var name = req.body[0].detail[0].language_POST
        var onDuty = req.body[0].onDuty_POST
        var offDuty = req.body[0].offDuty_POST
        var lateTolerance = req.body[0].lateTolerance_POST
        var earlyTolerance = req.body[0].earlyTolerance_POST
        var checkInOpen = req.body[0].checkInOpen_POST
        var checkInClosed = req.body[0].checkInClosed_POST
        var checkOutOpen = req.body[0].checkOutOpen_POST
        var checkOutClosed = req.body[0].checkOutClosed_POST
        let insertWorkingHoursData = await model.hrd_working_hours.create(
            {
                name: name,
                on_duty_time: onDuty,
                off_duty_time: offDuty,
                late_time: lateTolerance,
                leave_early_time: earlyTolerance,
                beginning_in: checkInOpen,
                ending_in: checkInClosed,
                beginning_out: checkOutOpen,
                ending_out: checkOutClosed,
            },
            {
                transaction: transaction
            }
        );
        if (insertWorkingHoursData) {
            selectLanguage(insertWorkingHoursData)
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectLanguage(insertWorkingHoursData) {
            let selectLanguageData = await model.adm_language.findAll({
                order: [
                    ['language_code', 'ASC'],
                ],
                transaction: transaction
            });
            var data = {
                dataWorkingHours: insertWorkingHoursData,
                dataLanguage: selectLanguageData
            }
            if (selectLanguageData) {
                insertWorkingHoursTranslations(data)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function insertWorkingHoursTranslations(data) {
            const workingHoursID = data.dataWorkingHours.id_working_hours
            // codeLanguage = data.dataLanguage.language_code
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const id_working_hours = JSON.parse('{"id_working_hours": ' + workingHoursID + '}')
                const language_code = JSON.parse('{"language_code": "' + data.dataLanguage[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(id_working_hours, language_code, translation);
                languageData.push(id_working_hours);
            }
            let insertWorkingHoursTranslationsData = await model.hrd_working_hours_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertWorkingHoursTranslationsData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertWorkingHoursTranslationsData,
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
        res.status(404).json({
            message: error,
        });
    }
}
controller.selectWorkingHoursByID = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var id = req.body.workingHoursID_POST
        let selectWorkingHoursByIDData = await model.hrd_working_hours.findAll(
            {
                include: {
                    model: model.hrd_working_hours_translations,
                    attributes: ["language_code", "translation"],
                    order: [
                        ['language_code', 'ASC'],
                    ],
                    // where: {
                    //     language_code: language
                    // },
                },
                where:
                {
                    id_working_hours: id
                },
                transaction: transaction
            },
        );

        if (selectWorkingHoursByIDData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: selectWorkingHoursByIDData,
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
controller.updateWorkingHours = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var id = req.params.id
        var language = req.body[0].language_POST
        var name = req.body[0].detail[0].language_POST
        var onDuty = req.body[0].onDuty_POST
        var offDuty = req.body[0].offDuty_POST
        var lateTolerance = req.body[0].lateTolerance_POST
        var earlyTolerance = req.body[0].earlyTolerance_POST
        var checkInOpen = req.body[0].checkInOpen_POST
        var checkInClosed = req.body[0].checkInClosed_POST
        var checkOutOpen = req.body[0].checkOutOpen_POST
        var checkOutClosed = req.body[0].checkOutClosed_POST
        let updateWorkingHoursData = await model.hrd_working_hours.update(
            {
                name: name,
                on_duty_time: onDuty,
                off_duty_time: offDuty,
                late_time: lateTolerance,
                leave_early_time: earlyTolerance,
                beginning_in: checkInOpen,
                ending_in: checkInClosed,
                beginning_out: checkOutOpen,
                ending_out: checkOutClosed,
            },
            {
                where:
                {
                    id_working_hours: id
                },
                transaction: transaction
            },
        );
        if (updateWorkingHoursData) {
            selectLanguage()
            // await transaction.commit();
            // res.status(200).json({
            //     access: "success",
            //     message: messages[language]?.updateData,
            //     data: updateWorkingHoursData,
            // });
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectLanguage() {
            let selectLanguageData = await model.adm_language.findAll({
                order: [
                    ['language_code', 'ASC'],
                ],
                transaction: transaction
            });
            if (selectLanguageData) {
                deleteWorkingHours(selectLanguageData)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function deleteWorkingHours(selectLanguageData) {
            let deleteWorkingHoursData = await model.hrd_working_hours_translations.destroy({
                where: {
                    id_working_hours: id
                },
                transaction: transaction
            });
            if (deleteWorkingHoursData) {
                insertWorkingHoursTranslations(selectLanguageData)
            }
        }
        async function insertWorkingHoursTranslations(selectLanguageData) {
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const id_working_hours = JSON.parse('{"id_working_hours": ' + id + '}')
                const language_code = JSON.parse('{"language_code": "' + selectLanguageData[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(id_working_hours, language_code, translation);
                languageData.push(id_working_hours);
            }
            let insertWorkingHoursTranslationsData = await model.hrd_working_hours_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertWorkingHoursTranslationsData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: insertWorkingHoursTranslationsData,
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
        res.status(404).json({
            message: error,
        });
    }
}
module.exports = controller;