const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectAssetType = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectAssetTypeData = await model.fat_asset_type.findAll({
            include: [
                {
                    model: model.fat_asset_type_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                },
                {
                    model: model.fat_coa,
                    include: {
                        model: model.fat_coa_translations,
                        attributes: ["language_code", "translation"],
                        where: {
                            language_code: language
                        },
                    },
                    as: "depreciation"
                },
                {
                    model: model.fat_coa,
                    include: {
                        model: model.fat_coa_translations,
                        attributes: ["language_code", "translation"],
                        where: {
                            language_code: language
                        },
                    },
                    as: "accumulated"
                },
            ],
            order: [
                ['code_asset_type', 'ASC'],
            ],
        });
        if (selectAssetTypeData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectAssetTypeData,
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
controller.selectAssetTypeByCode = async function (req, res) {
    try {
        var language = req.body.language_POST
        var code = req.body.code_POST
        let selectAssetTypeByCodeData = await model.fat_asset_type.findAll({
            include: [
                {
                    model: model.fat_asset_type_translations,
                    attributes: ["language_code", "translation"],
                    order: [
                        ['language_code', 'ASC'],
                    ],
                },
                {
                    model: model.fat_coa,
                    include: {
                        model: model.fat_coa_translations,
                        attributes: ["language_code", "translation"],
                        where: {
                            language_code: language
                        },
                    },
                    as: "depreciation"
                },
                {
                    model: model.fat_coa,
                    include: {
                        model: model.fat_coa_translations,
                        attributes: ["language_code", "translation"],
                        where: {
                            language_code: language
                        },
                    },
                    as: "accumulated"
                },
            ],
            where: {
                code_asset_type: code,
            },
        });
        if (selectAssetTypeByCodeData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectAssetTypeByCodeData,
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
controller.insertAssetType = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        var username = req.body[0].username_POST
        var depreciation = req.body[0].depreciation_POST
        var accumulated = req.body[0].accumulated_POST
        var code = req.body[0].code_POST
        var languageMenu = req.body[0].detail[0].language_POST
        let selectAssetTypeData = await model.fat_asset_type.findAll({
            where: {
                code_asset_type: code
            },
            transaction: transaction
        });
        if (selectAssetTypeData.length > 0) {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.duplicateData,
                data: [],
            });
        } else {
            insertAssetType()
        }
        async function insertAssetType() {
            let insertAssetTypeData = await model.fat_asset_type.create(
                {
                    code_asset_type: code,
                    description: languageMenu,
                    code_coa_depreciation: depreciation,
                    code_coa_accumulated : accumulated,
                },
                {
                    transaction: transaction
                }
            );
            if (insertAssetTypeData) {
                selectLanguage(insertAssetTypeData)
            } else {
                await transaction.rollback();
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
        async function selectLanguage(insertAssetTypeData) {
            let selectLanguageData = await model.adm_language.findAll({
                order: [
                    ['language_code', 'ASC'],
                ],
                transaction: transaction
            });
            var data = {
                dataTypeData: insertAssetTypeData,
                dataLanguage: selectLanguageData
            }
            if (selectLanguageData) {
                insertAssetTypeTranslations(data)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function insertAssetTypeTranslations(data) {
            var codeAssetType = data.dataTypeData.code_asset_type
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const codeAsset = JSON.parse('{"code_asset_type": "' + codeAssetType + '"}')
                const language_code = JSON.parse('{"language_code": "' + data.dataLanguage[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(codeAsset, language_code, translation);
                languageData.push(codeAsset);
            }
            let insertMenuTranslationsData = await model.fat_asset_type_translations.bulkCreate(
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
                logger.info('Insert Asset Type', {
                    "1.username": `${username}`,
                    "2.module": 'insertAssetType',
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
        res.status(404).json({
            message: error,
        });
    }
}
controller.updateAssetType = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        var username = req.body[0].username_POST
        var depreciation = req.body[0].depreciation_POST
        var accumulated = req.body[0].accumulated_POST
        var code = req.body[0].code_POST
        var languageMenu = req.body[0].detail[0].language_POST
        let updateMenuData = await model.fat_asset_type.update(
            {
                description: languageMenu,
                code_coa_depreciation: depreciation,
                code_coa_accumulated : accumulated,
            },
            {
                where:
                {
                    code_asset_type: code,
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
                deleteAssetType(selectLanguageData)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function deleteAssetType(selectLanguageData) {
            let deleteMenuData = await model.fat_asset_type_translations.destroy({
                where: {
                    code_asset_type: code,
                },
                transaction: transaction
            });
            if (deleteMenuData) {
                insertAssetType(selectLanguageData)
            }
        }
        async function insertAssetType(selectLanguageData) {
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const codeAsset = JSON.parse('{"code_asset_type": "' + code + '"}')
                const language_code = JSON.parse('{"language_code": "' + selectLanguageData[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(codeAsset, language_code, translation);
                languageData.push(codeAsset);
            }
            let insertMenuData = await model.fat_asset_type_translations.bulkCreate(
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
                logger.info('Update Asset Type', {
                    "1.username": `${username}`,
                    "2.module": 'updateAssetType',
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