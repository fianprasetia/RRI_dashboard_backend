const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectMenu = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectMenuData = await model.adm_menu.findAll({
            include: [
                {
                    model: model.adm_menu_translations,
                    attributes: ["translation"],
                    where:
                    {
                        language_code: language
                    },
                }
            ],
            order: [
                ['level', 'ASC'],
                ['no_ordinal', 'ASC'],
            ],
        });
        if (selectMenuData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectMenuData,
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
controller.selectMenuByCode = async function (req, res) {
    try {
        // var language = req.body.language_POST
        var code = req.body.code_POST
        let selectMenuByCodeData = await model.adm_menu.findAll({
            include: {
                model: model.adm_menu_translations,
                attributes: ["language_code", "translation"],
                order: [
                    ['language_code', 'ASC'],
                ],
                // where: {
                //     language_code: language
                // },
            },
            where: {
                id_menu: code
            },
        });
        if (selectMenuByCodeData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectMenuByCodeData,
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
controller.updateMenu = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        const username = req.body[0].username_POST
        var code = req.params.code
        var level = req.body[0].level_POST
        var parent = req.body[0].parent_POST
        var url = req.body[0].url_POST
        var icon = req.body[0].icon_POST
        var batch = req.body[0].batch_POST
        var languageMenu = req.body[0].detail[0].language_POST
        let updateMenuData = await model.adm_menu.update(
            {
                parent_id: parent,
                level: level,
                page: url,
                icon: icon,
                no_ordinal: batch,
                description: languageMenu,
            },
            {
                where:
                {
                    id_menu: code
                },
                transaction: transaction,
            },
        );
        if (updateMenuData) {
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
            let deleteMenuData = await model.adm_menu_translations.destroy({
                where: {
                    id_menu: code
                },
                transaction: transaction
            });
            if (deleteMenuData) {
                insertMenu(selectLanguageData)
            }
        }
        async function insertMenu(selectLanguageData) {
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const id_menu = JSON.parse('{"id_menu": ' + code + '}')
                const language_code = JSON.parse('{"language_code": "' + selectLanguageData[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(id_menu, language_code, translation);
                languageData.push(id_menu);
            }
            let insertMenuData = await model.adm_menu_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertMenuData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: insertMenuData,
                });
                logger.info('Update Menu', {
                    "1.username": `${username}`,
                    "2.module": 'updateMenu',
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
controller.insertMenu = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        const username = req.body[0].username_POST
        var level = req.body[0].level_POST
        var parent = req.body[0].parent_POST
        var url = req.body[0].url_POST
        var icon = req.body[0].icon_POST
        var batch = req.body[0].batch_POST
        var languageMenu = req.body[0].detail[0].language_POST
        let insertMenuData = await model.adm_menu.create(
            {
                parent_id: parent,
                level: level,
                page: url,
                icon: icon,
                no_ordinal: batch,
                description: languageMenu,
            },
            {
                transaction: transaction
            }
        );
        if (insertMenuData) {
            selectLanguage(insertMenuData)
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectLanguage(insertMenuData) {
            let selectLanguageData = await model.adm_language.findAll({
                order: [
                    ['language_code', 'ASC'],
                ],
                transaction: transaction
            });
            var data = {
                dataMenu: insertMenuData,
                dataLanguage: selectLanguageData
            }
            if (selectLanguageData) {
                insertMenuTranslations(data)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function insertMenuTranslations(data) {
            codeMenu = data.dataMenu.id_menu
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const id_menu = JSON.parse('{"id_menu": ' + codeMenu + '}')
                const language_code = JSON.parse('{"language_code": "' + data.dataLanguage[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(id_menu, language_code, translation);
                languageData.push(id_menu);
            }
            let insertMenuTranslationsData = await model.adm_menu_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertMenuTranslationsData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertMenuTranslationsData,
                });
                logger.info('Insert Menu', {
                    "1.username": `${username}`,
                    "2.module": 'insertMenu',
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