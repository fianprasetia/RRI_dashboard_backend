const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectTOP = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectTOPData = await model.log_term_of_payment.findAll({
            include: [
                {
                    model: model.log_term_of_payment_translations,
                    attributes: ["translation"],
                    where:
                    {
                        language_code: language
                    },
                }
            ],
            order: [
                ['code_term_of_payment', 'ASC']
            ],
        });
        if (selectTOPData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectTOPData,
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
controller.selectTOPByCode = async function (req, res) {
    try {
        var language = req.body.language_POST
        var code = req.body.code_POST
        let selectTOPByCodeData = await model.log_term_of_payment.findAll({
            include: {
                model: model.log_term_of_payment_translations,
                attributes: ["language_code", "translation"],
                order: [
                    ['language_code', 'ASC'],
                ],
            },
            where: {
                code_term_of_payment: code
            },
        });
        if (selectTOPByCodeData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectTOPByCodeData,
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
controller.updateTOP = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        const username = req.body[0].username_POST
        var type = req.body[0].type_POST
        var code = req.body[0].code_POST
        var languageMenu = req.body[0].detail[0].language_POST
        let updateTOPData = await model.log_term_of_payment.update(
            {
                type: type,
                description: languageMenu,
            },
            {
                where:
                {
                    code_term_of_payment: code
                },
                transaction: transaction,
            },
        );
        if (updateTOPData) {
            await selectLanguage()
        } else {
            await transaction.rollback();
            res.status(200).json({
                message: messages[language]?.nodata,
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
                deleteMenu(selectLanguageData)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function deleteMenu(selectLanguageData) {
            let deleteMenuData = await model.log_term_of_payment_translations.destroy({
                where: {
                    code_term_of_payment: code
                },
                transaction: transaction
            });
            if (deleteMenuData) {
                insertTOPTranslations(selectLanguageData)
            }
        }
        async function insertTOPTranslations(selectLanguageData) {
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const code_term_of_payment = JSON.parse('{"code_term_of_payment": ' + code + '}')
                const language_code = JSON.parse('{"language_code": "' + selectLanguageData[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(code_term_of_payment, language_code, translation);
                languageData.push(code_term_of_payment);
            }
            let insertTOPTranslationsData = await model.log_term_of_payment_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertTOPTranslationsData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: insertTOPTranslationsData,
                });
                logger.info('Update TOP', {
                    "1.username": `${username}`,
                    "2.module": 'updateTOP',
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
controller.insertTOP = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        const username = req.body.username_POST
        var type = req.body[0].type_POST
        var languageMenu = req.body[0].detail[0].language_POST
        let insertTOPData = await model.log_term_of_payment.create(
            {
                type: type,
                description: languageMenu,
            },
            {
                transaction: transaction
            }
        );
        if (insertTOPData) {
            selectLanguage(insertTOPData)
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectLanguage(insertTOPData) {
            let selectLanguageData = await model.adm_language.findAll({
                order: [
                    ['language_code', 'ASC'],
                ],
                transaction: transaction
            });
            var data = {
                dataTOP: insertTOPData,
                dataLanguage: selectLanguageData
            }
            if (selectLanguageData) {
                insertTOPTranslations(data)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function insertTOPTranslations(data) {
            var codeTOP = data.dataTOP.code_term_of_payment
            // codeLanguage = data.dataLanguage.language_code
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const code_term_of_payment = JSON.parse('{"code_term_of_payment": ' + codeTOP + '}')
                const language_code = JSON.parse('{"language_code": "' + data.dataLanguage[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(code_term_of_payment, language_code, translation);
                languageData.push(code_term_of_payment);
            }
            let insertTOPTranslationsData = await model.log_term_of_payment_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertTOPTranslationsData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertTOPTranslationsData,
                });
                logger.info('Insert TOP', {
                    "1.username": `${username}`,
                    "2.module": 'insertTOP',
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
module.exports = controller;